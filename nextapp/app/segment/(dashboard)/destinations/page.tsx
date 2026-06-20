'use client';

import { useEffect, useMemo, useState } from 'react';
import DestinationCard from '../../../../components/segment/DestinationCard';
import {
  SegmentDestination,
  segmentGetDestinations,
  segmentUpdateDestination,
} from '../../../../lib/segment-api';

const toFilters = (value: string) => {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

export default function SegmentDestinationsPage() {
  const [destinations, setDestinations] = useState<SegmentDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await segmentGetDestinations();
        setDestinations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load destinations');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const byType = useMemo(() => {
    const google = destinations.find(item => item.type === 'google_sheets');
    const postgres = destinations.find(item => item.type === 'postgres');
    return [google, postgres].filter(Boolean) as SegmentDestination[];
  }, [destinations]);

  const updateLocalDestination = (id: string, updater: (current: SegmentDestination) => SegmentDestination) => {
    setDestinations(prev => prev.map(item => (item._id === id ? updater(item) : item)));
  };

  const handleToggle = async (destination: SegmentDestination, enabled: boolean) => {
    const previous = destination.enabled;
    updateLocalDestination(destination._id, current => ({ ...current, enabled }));

    try {
      setSavingId(destination._id);
      const updated = await segmentUpdateDestination(destination._id, { enabled });
      updateLocalDestination(destination._id, () => updated);
    } catch (err) {
      updateLocalDestination(destination._id, current => ({ ...current, enabled: previous }));
      setError(err instanceof Error ? err.message : 'Failed to toggle destination');
    } finally {
      setSavingId('');
    }
  };

  const handleSave = async (destination: SegmentDestination) => {
    try {
      setSavingId(destination._id);
      const updated = await segmentUpdateDestination(destination._id, {
        enabled: destination.enabled,
        config: destination.config,
        eventFilters: destination.eventFilters,
      });
      updateLocalDestination(destination._id, () => updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save destination');
    } finally {
      setSavingId('');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading destinations...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Destinations</h1>
      <p className="text-sm text-gray-600">Enable or disable each destination and save config changes.</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {byType.map(destination => (
          <DestinationCard
            key={destination._id}
            destination={destination}
            onToggle={(enabled: boolean) => {
              void handleToggle(destination, enabled);
            }}
            onConfigChange={(key: string, value: string) => {
              updateLocalDestination(destination._id, current => ({
                ...current,
                config: {
                  ...(current.config || {}),
                  [key]: value,
                },
              }));
            }}
            onFiltersChange={(value: string) => {
              updateLocalDestination(destination._id, current => ({
                ...current,
                eventFilters: toFilters(value),
              }));
            }}
            onSave={() => {
              const latest = destinations.find(item => item._id === destination._id);
              if (!latest) {
                return;
              }
              void handleSave(latest);
            }}
            saving={savingId === destination._id}
          />
        ))}
      </div>
    </div>
  );
}
