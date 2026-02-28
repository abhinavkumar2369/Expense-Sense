/**
 * Dashboard Layout
 * =================
 * Wraps all /dashboard/* pages with sidebar + auth guard.
 */

"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import Spinner from "@/components/ui/Spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
