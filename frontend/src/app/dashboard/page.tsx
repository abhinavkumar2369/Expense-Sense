/**
 * Dashboard Overview Page
 * ========================
 * Displays summary stats, category breakdown, and monthly trend.
 */

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsSummary, APIResponse, PredictionResult } from "@/types";
import StatCard from "@/components/ui/StatCard";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import MonthlyLineChart from "@/components/charts/MonthlyLineChart";
import Spinner from "@/components/ui/Spinner";
import { DollarSign, TrendingUp, CreditCard, ShieldAlert, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, predRes] = await Promise.all([
          api.get<APIResponse<AnalyticsSummary>>("/analytics/summary"),
          api.get<APIResponse<PredictionResult>>("/analytics/predict"),
        ]);
        setSummary(summaryRes.data.data);
        setPrediction(predRes.data.data);
      } catch {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Spinner className="py-20" />;
  if (!summary) return <p className="text-gray-500 py-10">Unable to load data.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Your financial summary at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Spending"
          value={formatCurrency(summary.total_spending)}
          icon={DollarSign}
          color="text-indigo-600"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(summary.monthly_spending)}
          icon={TrendingUp}
          color="text-green-600"
        />
        <StatCard
          title="Transactions"
          value={summary.transaction_count.toString()}
          icon={CreditCard}
          color="text-blue-600"
        />
        <StatCard
          title="Fraud Alerts"
          value={summary.flagged_count.toString()}
          subtitle={summary.flagged_count > 0 ? "Review required" : "All clear"}
          icon={ShieldAlert}
          color={summary.flagged_count > 0 ? "text-red-600" : "text-green-600"}
        />
      </div>

      {/* AI Prediction Banner */}
      {prediction?.predicted_spending && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={20} />
            <h3 className="font-semibold">AI Spending Prediction</h3>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(prediction.predicted_spending)}{" "}
            <span className="text-sm font-normal opacity-80">predicted next month</span>
          </p>
          {prediction.confidence !== null && (
            <p className="text-sm opacity-75 mt-1">
              Model confidence: {(prediction.confidence * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <CategoryPieChart data={summary.category_breakdown} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <MonthlyLineChart data={summary.monthly_trend} />
        </div>
      </div>
    </div>
  );
}
