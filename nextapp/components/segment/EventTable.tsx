'use client';

import { SegmentRawEvent } from '../../lib/segment-api';

type Props = {
  events: SegmentRawEvent[];
};

export default function EventTable({ events }: Props) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
