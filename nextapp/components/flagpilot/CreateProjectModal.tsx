"use client";
import React, { useState } from "react";

export default function CreateProjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (proj: any) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const create = async () => {
    setError(null);
    if (!name.trim()) return setError("Project name is required");
    setLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagpilot/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      onCreated(data);
      setName("");
      onClose();
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-2">Create Project</h3>
        <label className="block mb-2">
          <div className="text-sm text-gray-600">Project name</div>
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
