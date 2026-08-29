"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FlagModal from "../../../../components/flagpilot/FlagModal";
import CopyKeyButton from "../../../../components/flagpilot/CopyKeyButton";
import apiClient from "../../../lib/api-client";

type Variant = {
  key: string;
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
  variants: Variant[];
};

type Project = {
  _id: string;
  name: string;
  apiKey: string;
};

export default function ProjectFlagsPage() {
  const params = useParams() as { projectId: string };
  const { projectId } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    try {
      const [projectRes, flagsRes] = await Promise.all([
        apiClient.get("/api/flagpilot/projects/" + projectId),
        apiClient.get("/api/flagpilot/flags?projectId=" + projectId),
      ]);

      setProject(projectRes.data);
      setFlags(flagsRes.data || []);
    } catch (err) {
      console.error("Failed to load project flags", err);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{project?.name || "Project"}</h1>
          <p className="text-sm text-gray-600">Manage flags, variants, and optimization thresholds.</p>
        </div>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => {
            setEditing(null);
            setShowCreate(true);
          }}
        >
          Create Flag
        </button>
      </div>

      {project?.apiKey && (
        <div className="border rounded p-3 mb-4 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Project API Key (use as x-api-key in SDK)</div>
            <div className="font-mono text-sm">{project.apiKey}</div>
          </div>
          <CopyKeyButton apiKey={project.apiKey} />
        </div>
      )}

      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="text-left p-2">Flag</th>
            <th className="p-2">Status</th>
            <th className="p-2">Goals</th>
            <th className="p-2">Traffic Split</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((flag) => (
            <tr key={flag._id} className="border-t">
              <td className="p-2">
                <a href={`/flagpilot/env/${flag._id}`} className="text-blue-600 font-medium">
                  {flag.key}
                </a>
                {flag.description && <div className="text-sm text-gray-600">{flag.description}</div>}
              </td>
              <td className="p-2 text-center capitalize">{flag.status}</td>
              <td className="p-2 text-center">
                {flag.trackedGoals?.length ? flag.trackedGoals.join(", ") : "None yet"}
              </td>
              <td className="p-2">
                <div className="space-y-1">
                  {flag.variants.map((variant) => (
                    <div key={variant.key} className="text-xs">
                      {variant.key}: {(variant.currentWeight * 100).toFixed(1)}%
                    </div>
                  ))}
                </div>
              </td>
              <td className="p-2 text-center">
                <button
                  className="px-2 py-1 mr-2 border rounded"
                  onClick={() => {
                    setEditing(flag);
                    setShowCreate(true);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <FlagModal
        open={showCreate}
        projectId={projectId}
        flag={editing}
        onClose={() => setShowCreate(false)}
        onSaved={() => load()}
      />
    </div>
  );
}
