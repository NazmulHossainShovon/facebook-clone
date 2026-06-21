import { Request, Response } from "express";
import { UserModel } from "../../models/userModel";
import {
  SegmentDestinationModel,
  SegmentDestination,
} from "../../models/segmentDestinationModel";
import { SegmentRawEventModel } from "../../models/segmentRawEventModel";
import { getIpAddress, shouldForwardEvent } from "./helpers";
import { segmentQueue } from "../../queues/segmentQueue";

// ensure worker is started
import "../../queues/segmentWorker";

export const trackEventHandler = async (req: Request, res: Response) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing API key" });
    return;
  }

  const apiKey = authorization.slice(7).trim();
  const user = await UserModel.findOne({ apiKey }).lean();
  if (!user) {
    res.status(401).json({ message: "Invalid API key" });
    return;
  }

  const eventName = String(req.body.event || "").trim();
  const externalUserId = req.body.userId !== undefined ? String(req.body.userId) : undefined;
  const properties = req.body.properties && typeof req.body.properties === "object" ? req.body.properties : {};

  if (!eventName) {
    res.status(400).json({ message: "event is required" });
    return;
  }

  const destinations = await SegmentDestinationModel.find({
    userId: (user as any)._id,
    enabled: true,
  }).lean();

  const filtered = destinations.filter(destination => shouldForwardEvent(eventName, destination.eventFilters));

  const rawEvent = await SegmentRawEventModel.create({
    userId: (user as any)._id,
    eventName,
    externalUserId,
    properties,
    ipAddress: getIpAddress(req),
    processed: filtered.length === 0, // if no destinations, mark processed
    pendingDestinations: filtered.length,
    createdAt: new Date(),
  });

  const createdAt = rawEvent.createdAt || new Date();

  // enqueue forwarding jobs for each destination
  for (const destination of filtered) {
    // job data
    const jobData = {
      destination: destination as SegmentDestination,
      payload: { eventName, externalUserId, properties, createdAt },
      rawEventId: String(rawEvent._id),
      retryCount: 0,
    };

    await segmentQueue.add('forward', jobData, { removeOnComplete: true });
  }

  res.json({ success: true, eventId: rawEvent._id });
};

export const recentEventsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const events = await SegmentRawEventModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(events);
};

export const retryEventHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const eventId = req.params.id;
  if (!eventId) {
    res.status(400).json({ message: 'Missing event id' });
    return;
  }

  const ev = await SegmentRawEventModel.findById(eventId).lean();
  if (!ev) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }

  if (String(ev.userId) !== String(userId)) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  // find enabled destinations for user and matching event filters
  const destinations = await SegmentDestinationModel.find({ userId, enabled: true }).lean();
  const filtered = destinations.filter(destination => shouldForwardEvent(ev.eventName, destination.eventFilters));

  if (filtered.length === 0) {
    res.json({ success: true, requeued: 0 });
    return;
  }

  // compute new failed count to avoid negative values and reset error info
  const existing = await SegmentRawEventModel.findById(eventId).lean();
  const currentFailed = existing?.failedDestinations || 0;
  const newFailed = Math.max(0, currentFailed - filtered.length);

  await SegmentRawEventModel.findByIdAndUpdate(eventId, {
    $set: { processed: false, lastError: undefined, lastFailedDestinationId: undefined, lastRetryCount: 0, failedDestinations: newFailed },
    $inc: { pendingDestinations: filtered.length },
  });

  for (const destination of filtered) {
    const jobData = {
      destination: destination as any,
      payload: {
        eventName: ev.eventName,
        externalUserId: ev.externalUserId,
        properties: ev.properties,
        createdAt: ev.createdAt || new Date(),
      },
      rawEventId: String(ev._id),
      retryCount: 0,
    };

    await segmentQueue.add('forward', jobData, { removeOnComplete: true });
  }

  res.json({ success: true, requeued: filtered.length });
};

export const clearEventsHandler = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    await SegmentRawEventModel.deleteMany({ userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear events' });
  }
};
