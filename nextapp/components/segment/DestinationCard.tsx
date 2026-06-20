'use client';

import { useMemo } from 'react';
import { SegmentDestination } from '../../lib/segment-api';

type Props = {
  destination: SegmentDestination;
  onToggle: (enabled: boolean) => void;
  onConfigChange: (key: string, value: string) => void;
  onFiltersChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
};

const getTitle = (type: SegmentDestination['type']) => {
  return type === 'google_sheets' ? 'Google Sheets' : 'PostgreSQL';
};

export default function DestinationCard({
  destination,
  onToggle,
  onConfigChange,
  onFiltersChange,
  onSave,
  saving,
}: Props) {
  const isGoogle = destination.type === 'google_sheets';
  const config = destination.config || {};
  const filtersValue = useMemo(
    () => (destination.eventFilters || []).join(', '),
    [destination.eventFilters]
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{getTitle(destination.type)}</h3>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span>{destination.enabled ? 'Enabled' : 'Disabled'}</span>
          <input
            type="checkbox"
            checked={destination.enabled}
            onChange={e => onToggle(e.target.checked)}
            className="h-4 w-4"
          />
        </label>
      </div>

      <div className={`space-y-3 ${!destination.enabled ? 'opacity-60' : ''}`}>
        {isGoogle ? (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Spreadsheet ID</label>
              <input
                type="text"
                value={String(config.spreadsheetId || '')}
                onChange={e => onConfigChange('spreadsheetId', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={!destination.enabled}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sheet Name</label>
              <input
                type="text"
                value={String(config.sheetName || 'Sheet1')}
                onChange={e => onConfigChange('sheetName', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={!destination.enabled}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Connection String</label>
              <input
                type="password"
                value={String(config.connectionString || '')}
                onChange={e => onConfigChange('connectionString', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={!destination.enabled}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Table Name</label>
              <input
                type="text"
                value={String(config.tableName || 'events')}
                onChange={e => onConfigChange('tableName', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={!destination.enabled}
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm text-gray-700 mb-1">Event Filters (comma separated)</label>
          <input
            type="text"
            value={filtersValue}
            onChange={e => onFiltersChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="purchase, page_view"
            disabled={!destination.enabled}
          />
          <p className="mt-1 text-xs text-gray-500">
            Empty means all events are forwarded.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
