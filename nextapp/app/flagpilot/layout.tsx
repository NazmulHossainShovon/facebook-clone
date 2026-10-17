import React from "react";
import "../globals.css";
import ProtectedRoute from "components/ProtectedRoute";
import FlagpilotSidebar from "components/flagpilot/FlagpilotSidebar";

export const metadata = { title: "Flagpilot" };

export default function FlagpilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen md:flex">
        <FlagpilotSidebar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
