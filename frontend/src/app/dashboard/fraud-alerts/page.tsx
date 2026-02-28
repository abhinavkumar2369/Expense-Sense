/**
 * Fraud Alerts Page
 * ==================
 * Displays flagged transactions with fraud scores.
 */

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, APIResponse, PaginatedData } from "@/types";
import Spinner from "@/components/ui/Spinner";
import { ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";

export default function FraudAlertsPage() {
  const [flagged, setFlagged] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<APIResponse<PaginatedData<Transaction>>>("/transactions", {
          params: { flagged: true, limit: 50 },
        });
        setFlagged(res.data.data.items);
        setTotal(res.data.data.total);
      } catch {
        console.error("Failed to load flagged transactions");
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
        <ShieldAlert className="text-red-500" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fraud Alerts</h2>
          <p className="text-gray-500 text-sm mt-1">
            {total} transaction{total !== 1 ? "s" : ""} flagged by the AI fraud detection model
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <p>
            Transactions are scored using an <strong>Isolation Forest</strong> anomaly detection model.
            Scores above <strong>65%</strong> are automatically flagged. Review each item to confirm or dismiss.
          </p>
        </div>
      </div>

      {flagged.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900">All Clear</h3>
          <p className="text-gray-500 text-sm mt-1">No suspicious transactions detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flagged.map((txn) => (
            <div
              key={txn.id}
              className="bg-white rounded-xl shadow-sm border border-red-100 p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h4 className="font-semibold text-gray-900">{txn.description}</h4>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>{formatDate(txn.created_at)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {txn.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(txn.amount)}</p>
                  <div className="mt-1">
                    <span className="text-xs font-medium text-red-600">
                      Fraud Score: {(txn.fraud_score * 100).toFixed(1)}%
                    </span>
                    <div className="mt-1 h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden ml-auto">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${txn.fraud_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
