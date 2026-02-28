/**
 * Monthly Spending Line Chart
 * ============================
 * Recharts-based line chart for monthly spending trend.
 */

"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { monthName } from "@/lib/utils";

interface MonthlyTrend {
  year: number;
  month: number;
  total: number;
  count: number;
}

interface MonthlyLineChartProps {
  data: MonthlyTrend[];
}

export default function MonthlyLineChart({ data }: MonthlyLineChartProps) {
  const chartData = data.map((d) => ({
    label: `${monthName(d.month)} ${d.year}`,
    spending: Math.round(d.total * 100) / 100,
    transactions: d.count,
  }));

  if (chartData.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-10">No data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} />
        <Area
          type="monotone"
          dataKey="spending"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#colorSpending)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
