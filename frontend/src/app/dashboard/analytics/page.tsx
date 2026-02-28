/**
 * Analytics Page
 * ===============
 * Category pie chart, monthly line chart, and AI prediction.
 */

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsSummary, PredictionResult, APIResponse } from "@/types";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import MonthlyLineChart from "@/components/charts/MonthlyLineChart";
import Spinner from "@/components/ui/Spinner";
import { Sparkles, TrendingUp, PieChart as PieIcon } from "lucide-react";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get<APIResponse<AnalyticsSummary>>("/analytics/summary"),
          api.get<APIResponse<PredictionResult>>("/analytics/predict"),
        ]);
        setSummary(sRes.data.data);
        setPrediction(pRes.data.data);
      } catch {
        console.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner className="py-20" />;
  if (!summary) return <p className="text-gray-500 py-10">Unable to load analytics.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Deep dive into your spending patterns</p>
      </div>

      {/* AI Prediction */}
      {prediction?.predicted_spending && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={20} />
            <h3 className="font-semibold">AI Spending Prediction (Linear Regression)</h3>
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(prediction.predicted_spending)}
          </p>
          <p className="text-sm opacity-80 mt-1">Predicted total spending for next month</p>
          {prediction.confidence !== null && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span>Model Confidence</span>
                <span>{(prediction.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={18} className="text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
          </div>
          <CategoryPieChart data={summary.category_breakdown} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-500" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Spending Trend</h3>
          </div>
          <MonthlyLineChart data={summary.monthly_trend} />
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Total Spent</th>
                <th className="px-4 py-3 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(summary.category_breakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <tr key={cat} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(amount)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {((amount / summary.total_spending) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
