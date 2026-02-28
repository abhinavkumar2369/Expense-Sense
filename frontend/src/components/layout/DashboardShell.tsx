/**
 * Dashboard Shell
 * ================
 * Wraps authenticated pages with sidebar + main content area.
 */

"use client";

import Sidebar from "./Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
