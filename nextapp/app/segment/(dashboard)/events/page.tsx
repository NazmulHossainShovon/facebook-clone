'use client';

import { useCallback, useEffect, useState } from 'react';
import EventTable from '../../../../components/segment/EventTable';
import { SegmentRawEvent, segmentRecentEvents } from '../../../../lib/segment-api';

export default function SegmentEventsPage() {
  const [events, setEvents] = useState<SegmentRawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    setError('');
    try {
      const data = await segmentRecentEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
    const interval = setInterval(() => {
      void loadEvents();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadEvents]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Live Events</h1>
          <p className="text-sm text-gray-600">Auto-refreshes every 5 seconds.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              void loadEvents();
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setEvents([])}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading events...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <EventTable events={events} />
    </div>
  );
}
