"use client";
import React, { useState } from "react";
import apiClient from "../../app/lib/api-client";

export default function CreateEnvironmentModal({ open, projectId, onClose, onCreated }: { open: boolean; projectId: string; onClose: () => void; onCreated: (env: any) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const create = async () => {
    setError(null);
    if (!name.trim()) return setError("Environment name is required");
    setLoading(true);
    try {
      const res = await apiClient.post("/api/flagpilot/environments", {
        name: name.trim(),
        projectId,
      });
      onCreated(res.data);
      setName("");
      onClose();
    } catch (err) {
      setError("Failed to create environment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-2">Create Environment</h3>
        <label className="block mb-2">
          <div className="text-sm text-gray-600">Environment name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
        </label>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={create} disabled={loading}>{loading ? 'Creating…' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}
