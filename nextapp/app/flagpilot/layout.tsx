import React from "react";
import "../globals.css";
import ProtectedRoute from "components/ProtectedRoute";

export const metadata = { title: "Flagpilot" };

export default function FlagpilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        <aside className="w-64 bg-gray-100 p-4">
          <h2 className="font-bold mb-4">Flagpilot</h2>
          <div id="flagpilot-sidebar">Select a project to get started</div>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
