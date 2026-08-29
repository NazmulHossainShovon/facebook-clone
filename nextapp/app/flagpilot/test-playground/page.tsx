"use client";

import React, { useState } from "react";
import { FlagpilotProvider, useFlag, useTrackGoal } from "flagpilot-react";

// Default configuration for the variant card
type CardConfig = {
  cardTitle: string;
  themeColor: "emerald" | "blue" | "indigo" | "rose" | "gray";
  showDiscount: boolean;
  discountPercent: number;
  buttonLabel: string;
};

const DEFAULT_CARD_CONFIG: CardConfig = {
  cardTitle: "Starter Plan",
  themeColor: "gray",
  showDiscount: false,
  discountPercent: 0,
  buttonLabel: "Get Started",
};

function TestPlayground({
  flagKey,
  goalEvent,
}: {
  flagKey: string;
  goalEvent: string;
}) {
  const trackGoal = useTrackGoal();
  const { value: config, isLoading, refetch } = useFlag<CardConfig>(
    flagKey,
    goalEvent,
    DEFAULT_CARD_CONFIG
  );

  const [conversionStatus, setConversionStatus] = useState<string | null>(null);

  const handleButtonClick = async () => {
    setConversionStatus("Tracking conversion...");
    try {
      await trackGoal(goalEvent);
      setConversionStatus("Goal successfully tracked! Conversion recorded in Flagpilot.");
      setTimeout(() => setConversionStatus(null), 4000);
    } catch {
      setConversionStatus("Failed to track conversion goal.");
    }
  };

  // Safe color mapper for dynamic tailwind classes
  const themeClasses = {
    emerald: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-800",
      button: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    blue: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      badge: "bg-blue-100 text-blue-800 border-blue-200",
    },
    indigo: {
      bg: "bg-indigo-50 border-indigo-200",
      text: "text-indigo-800",
      button: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
      badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    rose: {
      bg: "bg-rose-50 border-rose-200",
      text: "text-rose-800",
      button: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
      badge: "bg-rose-100 text-rose-800 border-rose-200",
    },
    gray: {
      bg: "bg-gray-50 border-gray-200",
      text: "text-gray-800",
      button: "bg-gray-700 hover:bg-gray-800 focus:ring-gray-500",
      badge: "bg-gray-200 text-gray-800 border-gray-300",
    },
  };

  const theme = themeClasses[config?.themeColor] || themeClasses.gray;

  // Retrieve current anonymous ID from local storage for display
  const currentAnonId = typeof window !== "undefined" ? window.localStorage.getItem("af_anon_id") : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold">Dynamic Experience Playground</h2>
          <p className="text-sm text-gray-500">
            This component renders dynamically using variant values served in real-time.
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
        >
          Refresh Flag
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 border rounded bg-gray-50">
          <div className="text-gray-500">Evaluating feature flag...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual Dynamic Card */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Rendered UI Card</h3>
            <div className={`p-6 border rounded-xl shadow-sm transition-all duration-300 ${theme.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`text-2xl font-bold ${theme.text}`}>
                    {config?.cardTitle || "Starter Plan"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Unlock our standard core features with flexible billing.
                  </p>
                </div>
                {config?.showDiscount && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${theme.badge}`}>
                    {config.discountPercent}% Off!
                  </span>
                )}
              </div>

              <div className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$29</span>
                <span className="text-gray-500 text-sm"> / month</span>
              </div>

              <button
                onClick={handleButtonClick}
                className={`mt-6 w-full text-white py-2.5 px-4 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.button}`}
              >
                {config?.buttonLabel || "Get Started"}
              </button>

              {conversionStatus && (
                <div className="mt-4 text-xs font-semibold text-center text-blue-700 animate-pulse">
                  {conversionStatus}
                </div>
              )}
            </div>
          </div>

          {/* Raw SDK State Inspector */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Raw SDK State Inspector</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
              <div>
                <span className="text-emerald-400">// Active Flag Evaluated:</span>
                <div className="pl-4">flagKey: "{flagKey}"</div>
                <div className="pl-4">goalEvent: "{goalEvent}"</div>
                <div className="pl-4">anonUserId: "{currentAnonId || "Generating..."}"</div>
              </div>
              <div className="border-t border-gray-800 pt-2">
                <span className="text-emerald-400">// Received Config Object:</span>
                <pre className="mt-1 text-sky-300">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlagpilotTestPage() {
  const [apiKey, setApiKey] = useState("");
  const [flagKey, setFlagKey] = useState("promo_card_experiment");
  const [goalEvent, setGoalEvent] = useState("promo_card_clicked");
  const [isConnected, setIsConnected] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const handleResetSession = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("af_anon_id");
    }
    setSessionKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-6 space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Rich Configurable Variants Playground</h1>
        <p className="text-gray-600">
          This test page lets you verify visual changes and real-time auto-optimization via Flagpilot's JSON variants.
        </p>
      </div>

      {!isConnected ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-white border p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">1. Connect Your Project</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project API Key
                </label>
                <input
                  type="text"
                  placeholder="fp_proj_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flag Key
                  </label>
                  <input
                    type="text"
                    value={flagKey}
                    onChange={(e) => setFlagKey(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Event
                  </label>
                  <input
                    type="text"
                    value={goalEvent}
                    onChange={(e) => setGoalEvent(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    setIsConnected(true);
                  }
                }}
                disabled={!apiKey.trim()}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Connect to Flagpilot SDK
              </button>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 border p-6 rounded-xl">
            <h2 className="text-md font-bold text-gray-800">Quick Dashboard Guide</h2>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-2.5">
              <li>
                Go to the <a href="/flagpilot" className="text-blue-600 underline font-medium">Flagpilot Dashboard</a>.
              </li>
              <li>Create a new project and copy its **API Key**.</li>
              <li>Create a flag with key <code>promo_card_experiment</code>.</li>
              <li>
                Add a variant with key <code>control</code> and value:
                <pre className="mt-1 p-1 bg-gray-200 rounded font-mono text-[10px] overflow-x-auto">
                  {`{\n  "cardTitle": "Starter Plan",\n  "themeColor": "gray",\n  "showDiscount": false,\n  "discountPercent": 0,\n  "buttonLabel": "Get Started"\n}`}
                </pre>
              </li>
              <li>
                Add another variant with key <code>variant_b</code> and value:
                <pre className="mt-1 p-1 bg-gray-200 rounded font-mono text-[10px] overflow-x-auto">
                  {`{\n  "cardTitle": "Super Saver Pro",\n  "themeColor": "blue",\n  "showDiscount": true,\n  "discountPercent": 25,\n  "buttonLabel": "Get 25% Off!"\n}`}
                </pre>
              </li>
              <li>Activate the flag and hit Connect above!</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50 border border-blue-100 p-4 rounded-xl gap-3">
            <div className="text-sm text-blue-800 font-medium font-mono">
              Connected with API Key: {apiKey.substring(0, 12)}...
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetSession}
                className="bg-white border border-blue-200 text-xs text-blue-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition shadow-sm"
                title="Clears local storage session ID to generate a brand new user session"
              >
                Reset User Session (Simulate New Visitor)
              </button>
              <button
                onClick={() => setIsConnected(false)}
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1.5 font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>

          <FlagpilotProvider key={sessionKey} apiKey={apiKey} baseUrl="http://localhost:4000/api/flagpilot/v1">
            <TestPlayground flagKey={flagKey} goalEvent={goalEvent} />
          </FlagpilotProvider>
        </div>
      )}
    </div>
  );
}
