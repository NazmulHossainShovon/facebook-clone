"use client";
import React, { useEffect, useState } from "react";

type Flag = {
  _id?: string;
  key: string;
  name: string;
  description?: string;
  type: "BOOLEAN" | "STRING";
  enabled: boolean;
  value?: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export default function FlagModal({
  open,
  environmentId,
  flag,
  onClose,
  onSaved,
}: {
  open: boolean;
  environmentId: string;
  flag?: Flag | null;
  onClose: () => void;
  onSaved: (f: any) => void;
}) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [type, setType] = useState<"BOOLEAN" | "STRING">("BOOLEAN");
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flag) {
      setName(flag.name || "");
      setKey(flag.key || "");
      setType(flag.type || "BOOLEAN");
      setEnabled(!!flag.enabled);
      setValue(flag.value || "");
    } else {
      setName("");
      setKey("");
      setType("BOOLEAN");
      setEnabled(false);
      setValue("");
    }
  }, [flag, open]);

  useEffect(() => {
    if (!flag) setKey(slugify(name));
  }, [name]);

  if (!open) return null;

  const save = async () => {
    setError(null);
    if (!name.trim() || !key.trim()) return setError("Name and key are required");
    setLoading(true);
    try {
      const payload = { environmentId, key, name, type, enabled, value };
      let res;
      if (flag && flag._id) {
        res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagsmith/flags/" + flag._id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagsmith/flags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      onSaved(data);
      onClose();
    } catch (err) {
      setError("Failed to save flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded shadow p-6 w-full max-w-lg">
        <h3 className="text-lg font-bold mb-2">{flag ? "Edit Flag" : "Create Flag"}</h3>

        <label className="block mb-2">
          <div className="text-sm text-gray-600">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
        </label>

        <label className="block mb-2">
          <div className="text-sm text-gray-600">Key (unique within environment)</div>
          <input value={key} onChange={(e) => setKey(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
        </label>

        <label className="block mb-2">
          <div className="text-sm text-gray-600">Type</div>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 block w-full border rounded px-2 py-1">
            <option value="BOOLEAN">Boolean (on/off)</option>
            <option value="STRING">String (text value)</option>
          </select>
        </label>

        {type === "STRING" && (
          <label className="block mb-2">
            <div className="text-sm text-gray-600">Value</div>
            <input value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 block w-full border rounded px-2 py-1" />
          </label>
        )}

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span>Enabled</span>
        </label>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
