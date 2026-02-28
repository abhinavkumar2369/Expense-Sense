/**
 * Category Pie Chart
 * ===================
 * Recharts-based pie chart for spending by category.
 */

"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CATEGORY_COLORS } from "@/lib/utils";

interface CategoryPieChartProps {
  data: Record<string, number>;
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));

  if (chartData.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-10">No data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={120}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={CATEGORY_COLORS[entry.name] || "#94a3b8"}
            />
          ))}
        </Pie>
        <Tooltip formatter={(val) => `$${Number(val).toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
