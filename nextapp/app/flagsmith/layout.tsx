import React from "react";
import "../globals.css";

export const metadata = { title: "Flagsmith" };

export default function FlagsmithLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4"> 
        <h2 className="font-bold mb-4">Flagsmith</h2>
        <div id="flagsmith-sidebar">Select a project to get started</div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
