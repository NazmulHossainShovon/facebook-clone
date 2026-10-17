"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "../../app/lib/api-client";

type Project = {
  _id: string;
  name: string;
};

function getActiveClass(isActive: boolean): string {
  if (isActive) {
    return "block rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white";
  }

  return "block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200";
}

export default function FlagpilotSidebar() {
  const pathname = usePathname() || "/flagpilot";
  const [projects, setProjects] = useState<Project[]>([]);

  const projectMatch = pathname.match(/^\/flagpilot\/([^/]+)\/environments/);
  const flagMatch = pathname.match(/^\/flagpilot\/env\/([^/]+)/);

  const projectId = projectMatch?.[1];
  const flagId = flagMatch?.[1];

  useEffect(() => {
    apiClient.get("/api/flagpilot/projects")
      .then((res) => {
        setProjects(Array.isArray(res.data) ? res.data.slice(0, 8) : []);
      })
      .catch(() => {
        setProjects([]);
      });
  }, []);

  return (
    <aside className="w-full border-b bg-gray-100 p-4 md:w-72 md:min-h-screen md:border-b-0 md:border-r">
      <h2 className="mb-1 text-lg font-bold text-gray-900">Flagpilot</h2>
      <p className="mb-4 text-xs text-gray-600">Manage projects, flags, and experiments.</p>

      <nav className="space-y-1">
        <Link href="/flagpilot" className={getActiveClass(pathname === "/flagpilot")}>
          Projects
        </Link>

        <Link href="/flagpilot/test-playground" className={getActiveClass(pathname === "/flagpilot/test-playground")}>
          Test Playground
        </Link>

        {projects.length ? (
          <div className="mt-3">
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Quick Project Links
            </div>
            <div className="space-y-1">
              {projects.map((project) => {
                const href = `/flagpilot/${project._id}/environments`;
                return (
                  <Link
                    key={project._id}
                    href={href}
                    className={getActiveClass(pathname.startsWith(href))}
                    title={project.name}
                  >
                    <span className="block truncate">{project.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        {projectId ? (
          <Link
            href={`/flagpilot/${projectId}/environments`}
            className={getActiveClass(pathname.startsWith(`/flagpilot/${projectId}/environments`))}
          >
            Current Project Flags
          </Link>
        ) : null}

        {flagId ? (
          <Link
            href={`/flagpilot/env/${flagId}`}
            className={getActiveClass(pathname.startsWith(`/flagpilot/env/${flagId}`))}
          >
            Current Flag Analytics
          </Link>
        ) : null}

      </nav>

      {!projectId && !flagId ? (
        <div className="mt-4 rounded-md bg-white p-3 text-xs text-gray-600">
          Open a project to get direct links to project flags and flag analytics.
        </div>
      ) : null}
    </aside>
  );
}
