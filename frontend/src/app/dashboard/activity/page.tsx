/**
 * Activity Log Page
 * ==================
 * View the current user's activity history.
 */

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ActivityLog, APIResponse, PaginatedData } from "@/types";
import Spinner from "@/components/ui/Spinner";
import { Activity, Clock } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700",
  UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-700",
  LOGIN: "bg-indigo-50 text-indigo-700",
  REGISTER: "bg-purple-50 text-purple-700",
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<APIResponse<PaginatedData<ActivityLog>>>("/activity-logs", {
          params: { limit: 50 },
        });
        setLogs(res.data.data.items);
      } catch {
        console.error("Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="text-indigo-500" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-gray-500 text-sm mt-1">Your recent account activity</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No activity recorded yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition">
              <div className="p-2 rounded-lg bg-gray-100 mt-0.5">
                <Clock size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || "bg-gray-50 text-gray-700"}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{log.resource}</span>
                  {log.resource_id && (
                    <span className="text-xs text-gray-400 truncate max-w-[200px]">{log.resource_id}</span>
                  )}
                </div>
                {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
