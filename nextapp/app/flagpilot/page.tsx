"use client";
import React, { useEffect, useState } from "react";
import CreateProjectModal from "../../components/flagpilot/CreateProjectModal";

type Project = { _id: string; name: string };

export default function FlagpilotIndex() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setLoading(true);
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/api/flagpilot/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setShowCreate(true)}>Create Project</button>
      </div>

      {loading && <div>Loading...</div>}

      {!loading && projects.length === 0 && (
        <div className="p-4 border rounded">No projects yet. Click "Create Project" to add one.</div>
      )}

      <ul>
        {projects.map((p) => (
          <li key={p._id} className="p-2 border rounded mb-2">
            <a href={`/flagpilot/${p._id}/environments`} className="text-blue-600">{p.name}</a>
          </li>
        ))}
      </ul>

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={(proj) => setProjects((cur) => [proj, ...cur])} />
    </div>
  );
}
