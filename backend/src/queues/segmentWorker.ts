import { Worker, Job } from 'bullmq';
import { appendToGoogleSheets, appendToPostgres } from '../routers/segment/helpers';
import { segmentQueue } from './segmentQueue';
import { SegmentDestination } from '../models/segmentDestinationModel';
import { SegmentRawEventModel } from '../models/segmentRawEventModel';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
};

const RETRY_DELAYS = [1000, 5000, 30000, 300000]; // 1s,5s,30s,5m

type JobData = {
  destination: SegmentDestination;
  payload: {
    eventName: string;
    externalUserId?: string;
    properties?: Record<string, unknown>;
    createdAt: string | Date;
  };
  rawEventId: string;
  retryCount?: number;
};

const worker = new Worker<JobData>(
  'segment-forward',
  async (job: Job<JobData>) => {
    const { destination, payload, rawEventId, retryCount = 0 } = job.data;

    try {
      if (destination.type === 'google_sheets') {
        await appendToGoogleSheets(destination as SegmentDestination, {
          eventName: payload.eventName,
          externalUserId: payload.externalUserId,
          properties: payload.properties,
          createdAt: new Date(payload.createdAt),
        });
      } else {
        await appendToPostgres(destination as SegmentDestination, {
          eventName: payload.eventName,
          externalUserId: payload.externalUserId,
          properties: payload.properties,
          createdAt: new Date(payload.createdAt),
        });
      }

      // success: increment succeededDestinations, decrement pending
      await SegmentRawEventModel.findByIdAndUpdate(rawEventId, {
        $inc: { succeededDestinations: 1, pendingDestinations: -1 },
      });

      // if pending reaches 0, mark processed true
      const ev = await SegmentRawEventModel.findById(rawEventId).lean();
      if (ev && (ev.pendingDestinations || 0) <= 0) {
        await SegmentRawEventModel.findByIdAndUpdate(rawEventId, { processed: true });
      }
    } catch (err) {
      // failure: retry with custom delays
      const nextRetry = (retryCount || 0) + 1;

      // update event with last error info and retry count
      try {
        await SegmentRawEventModel.findByIdAndUpdate(rawEventId, {
          lastError: err instanceof Error ? err.message : String(err),
          lastFailedDestinationId: destination._id,
          lastRetryCount: nextRetry,
        });
      } catch (updateErr) {
        // ignore
      }

      if (retryCount < RETRY_DELAYS.length) {
        // re-add job with increased retryCount and delay via shared queue
        await segmentQueue.add(
          'forward',
          { ...job.data, retryCount: nextRetry },
          { delay: RETRY_DELAYS[retryCount], removeOnComplete: true }
        );
        return;
      }

      // exhausted retries: mark failed
      await SegmentRawEventModel.findByIdAndUpdate(rawEventId, {
        $inc: { failedDestinations: 1, pendingDestinations: -1 },
      });

      const ev = await SegmentRawEventModel.findById(rawEventId).lean();
      if (ev && (ev.pendingDestinations || 0) <= 0) {
        await SegmentRawEventModel.findByIdAndUpdate(rawEventId, { processed: true });
      }

      // log error
      // eslint-disable-next-line no-console
      console.error('Segment forwarding job failed for destination', destination._id, err instanceof Error ? err.message : err);
    }
  },
  { connection }
);

worker.on('failed', (job, err) => {
  // job failure is handled by our logic by re-adding; still log
  // eslint-disable-next-line no-console
  console.warn('Worker reported failed job', job?.id, err?.message || err);
});

export default worker;
