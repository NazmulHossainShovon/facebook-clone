'use client';

import { useEffect, useMemo, useState } from 'react';
import { segmentMe } from '../../../../lib/segment-api';

export default function SegmentSourcesPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await segmentMe();
        setApiKey(result.user.apiKey || '');
        localStorage.setItem('segment-user', JSON.stringify(result.user));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API key');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const curlSnippet = useMemo(() => {
    return `curl -X POST ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/segment/events/track \\\n  -H \"Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"event\": \"test_event\", \"userId\": \"user_123\", \"properties\": {\"plan\": \"premium\"}}'`;
  }, [apiKey]);

  const copyApiKey = async () => {
    if (!apiKey) {
      return;
    }
    await navigator.clipboard.writeText(apiKey);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Sources</h1>
      <p className="text-sm text-gray-600">Use this API key from your app to send events.</p>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm text-gray-700">API Key</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={loading ? 'Loading...' : apiKey}
            readOnly
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={() => setShowKey(prev => !prev)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            onClick={copyApiKey}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Copy to Clipboard
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-700">Quick test</p>
        <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs text-gray-100">{curlSnippet}</pre>
      </div>
    </div>
  );
}
