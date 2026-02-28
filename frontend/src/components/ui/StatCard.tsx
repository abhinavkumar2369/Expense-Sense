/**
 * Reusable stats card for the dashboard overview.
 */

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = "text-indigo-600" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-lg bg-gray-50", color)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
