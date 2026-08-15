"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Variant = {
  key: string;
  value: unknown;
  impressions: number;
  conversions: number;
  currentWeight: number;
};

type Flag = {
  _id: string;
  key: string;
  description?: string;
  status: "active" | "paused" | "archived";
  trackedGoals: string[];
  minImpressionsBeforeOptimization: number;
  variants: Variant[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function toPercent(num: number): string {
  return `${(num * 100).toFixed(1)}%`;
}

export default function FlagDetailPage() {
  const params = useParams() as { environmentId: string };
  const flagId = params.environmentId;

  const [flag, setFlag] = useState<Flag | null>(null);

  const load = async () => {
    const res = await fetch(API_BASE + "/api/flagpilot/flags/" + flagId, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    setFlag(data);
  };

  useEffect(() => {
    load();
    const intervalId = setInterval(load, 10000);
    return () => clearInterval(intervalId);
  }, [flagId]);

  const totalImpressions = useMemo(() => {
    return (flag?.variants || []).reduce((sum, variant) => sum + variant.impressions, 0);
  }, [flag]);

  if (!flag) {
    return <div>Loading flag details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border rounded p-4">
        <h1 className="text-2xl font-bold">FLAG: {flag.key}</h1>
        <div className="text-sm text-gray-600 mt-1">Status: {flag.status}</div>
        {flag.description && <div className="text-sm mt-2">{flag.description}</div>}
        <div className="mt-3 text-sm">
          AUTO-DETECTED GOALS: {flag.trackedGoals?.length ? flag.trackedGoals.join(", ") : "None yet"}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Optimization threshold: {flag.minImpressionsBeforeOptimization} impressions
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">Traffic Distribution (Thompson Sampling)</h2>
        <div className="space-y-2">
          {flag.variants.map((variant) => (
            <div key={variant.key}>
              <div className="flex justify-between text-sm mb-1">
                <span>{variant.key}</span>
                <span>{toPercent(variant.currentWeight)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: `${Math.max(2, variant.currentWeight * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">Variant Performance</h2>
        <table className="w-full table-auto text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Variant</th>
              <th className="p-2">Impressions</th>
              <th className="p-2">Conversions</th>
              <th className="p-2">Conv Rate</th>
              <th className="p-2">Traffic Split</th>
            </tr>
          </thead>
          <tbody>
            {flag.variants.map((variant) => {
              const convRate = variant.impressions > 0 ? variant.conversions / variant.impressions : 0;
              return (
                <tr key={variant.key} className="border-t">
                  <td className="p-2">{variant.key}</td>
                  <td className="p-2 text-center">{variant.impressions.toLocaleString()}</td>
                  <td className="p-2 text-center">{variant.conversions.toLocaleString()}</td>
                  <td className="p-2 text-center">{toPercent(convRate)}</td>
                  <td className="p-2 text-center">{toPercent(variant.currentWeight)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-xs text-gray-500 mt-3">Total impressions: {totalImpressions.toLocaleString()}</div>
      </div>
    </div>
  );
}
