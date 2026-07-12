"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FlagModal from "../../../../components/flagpilot/FlagModal";

type Flag = { _id: string; key: string; name: string; type: "BOOLEAN" | "STRING"; enabled: boolean; value: string };
type Env = { _id: string; name: string; apiKey: string };

export default function FlagManagerPage() {
  const params = useParams() as { environmentId: string };
  const { environmentId } = params;
  const [env, setEnv] = useState<Env | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Flag | null>(null);

  const load = () => {
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagpilot/flags?environmentId=" + environmentId)
      .then((r) => r.json())
      .then((data) => setFlags(data || []));
  };

  useEffect(() => {
    load();
  }, [environmentId]);

  const toggleFlag = async (f: Flag) => {
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagpilot/flags/" + f._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !f.enabled }),
    });
    if (res.ok) {
      setFlags((cur) => cur.map((x) => (x._id === f._id ? { ...x, enabled: !x.enabled } : x)));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Flag Manager</h1>
        <div>
          <button className="bg-green-600 text-white px-3 py-1 rounded mr-2" onClick={() => { setEditing(null); setShowModal(true); }}>Create Flag</button>
        </div>
      </div>

      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="text-left p-2">Name / Key</th>
            <th className="p-2">Type</th>
            <th className="p-2">Enabled</th>
            <th className="p-2">Value</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((f) => (
            <tr key={f._id} className="border-t">
              <td className="p-2">{f.name} <div className="text-sm text-gray-500">{f.key}</div></td>
              <td className="p-2">{f.type}</td>
              <td className="p-2">
                <input type="checkbox" checked={f.enabled} onChange={() => toggleFlag(f)} />
              </td>
              <td className="p-2">{f.value}</td>
              <td className="p-2">
                <button className="px-2 py-1 mr-2 border rounded" onClick={() => { setEditing(f); setShowModal(true); }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <FlagModal open={showModal} environmentId={environmentId} flag={editing} onClose={() => setShowModal(false)} onSaved={(f) => { load(); }} />
    </div>
  );
}
