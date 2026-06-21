'use client';

import { SegmentRawEvent, segmentRetryEvent } from '../../lib/segment-api';
import { useState } from 'react';

type Props = {
  events: SegmentRawEvent[];
};

export default function EventTable({ events }: Props) {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        No events yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Event Name</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">User ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Properties</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Counts (S / P / F)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Retries</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Last Error</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map(event => (
            <tr key={event._id}>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {new Date(event.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">{event.eventName}</td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{event.externalUserId || '-'}</td>
              <td className="px-4 py-3 text-gray-700 max-w-[420px] truncate">
                {JSON.stringify(event.properties || {})}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {event.pendingDestinations && event.pendingDestinations > 0 ? (
                  'pending'
                ) : (event.succeededDestinations || 0) > 0 && (event.pendingDestinations || 0) === 0 ? (
                  'succeeded'
                ) : (event.failedDestinations || 0) > 0 ? (
                  'failed'
                ) : event.processed ? (
                  'processed'
                ) : (
                  'unknown'
                )}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {(event.succeededDestinations || 0) + ' / ' + (event.pendingDestinations || 0) + ' / ' + (event.failedDestinations || 0)}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{event.lastRetryCount || 0}</td>
              <td className="px-4 py-3 text-red-600 max-w-[320px] truncate">{event.lastError || '-'}</td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {(event.failedDestinations || 0) > 0 && (event.pendingDestinations || 0) === 0 && (event.succeededDestinations || 0) === 0 ? (
                  <button
                    type="button"
                    disabled={retryingId === event._id}
                    onClick={async () => {
                      setRetryingId(event._id);
                      try {
                        await segmentRetryEvent(event._id);
                        // naive: reload page after retry — parent page polls every 5s
                        window.location.reload();
                      } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error(err);
                        alert(err instanceof Error ? err.message : 'Retry failed');
                      } finally {
                        setRetryingId(null);
                      }
                    }}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {retryingId === event._id ? 'Retrying…' : 'Retry'}
                  </button>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
