"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CreateEnvironmentModal from "../../../../components/flagpilot/CreateEnvironmentModal";
import CopyKeyButton from "../../../../components/flagpilot/CopyKeyButton";

type Env = { _id: string; name: string; apiKey: string };

export default function EnvironmentsPage() {
  const params = useParams() as { projectId: string };
  const { projectId } = params;
  const [envs, setEnvs] = useState<Env[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagpilot/environments?projectId=" + projectId)
      .then((r) => r.json())
      .then((data) => setEnvs(data || []));
  };

  useEffect(() => {
    load();
  }, [projectId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Environments</h1>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setShowCreate(true)}>Create Environment</button>
      </div>

      <ul>
        {envs.map((e) => (
          <li key={e._id} className="p-2 border rounded mb-2 flex items-start justify-between">
            <div>
              <a href={`/flagpilot/env/${e._id}`} className="text-blue-600">{e.name}</a>
              <div className="text-sm text-gray-600">API Key: {e.apiKey}</div>
            </div>
            <div className="flex items-center gap-2">
              <CopyKeyButton apiKey={e.apiKey} />
            </div>
          </li>
        ))}
      </ul>

      <CreateEnvironmentModal
        open={showCreate}
        projectId={projectId}
        onClose={() => setShowCreate(false)}
        onCreated={(env) => setEnvs((cur) => [env, ...cur])}
      />
    </div>
  );
}
