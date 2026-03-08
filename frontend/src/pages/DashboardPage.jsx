import { useEffect, useState } from "react";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchSummary } from "../services/expenseService";
import { fetchBudgetStatus } from "../services/budgetService";
import LoadingSpinner from "../components/LoadingSpinner";

const colors = ["#16a34a", "#ff6b35", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryData, budgetData] = await Promise.all([fetchSummary(), fetchBudgetStatus()]);
        setSummary(summaryData);
        setBudget(budgetData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-slate-600">Monthly Spending</p>
          <p className="text-2xl font-bold text-ink">${summary?.monthlyTotal?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-slate-600">Monthly Budget</p>
          <p className="text-2xl font-bold text-ink">${budget?.monthlyBudget?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="text-slate-600">Budget Used</p>
          <p className={`text-2xl font-bold ${budget?.exceeded ? "text-red-600" : "text-brand-700"}`}>
            {budget?.percentageUsed || 0}%
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-card h-80">
          <h3 className="font-heading mb-3">Category Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary?.categoryWise || []}
                dataKey="total"
                nameKey="_id"
                outerRadius={110}
                label
              >
                {(summary?.categoryWise || []).map((entry, index) => (
                  <Cell key={entry._id} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card h-80">
          <h3 className="font-heading mb-3">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={(summary?.weeklyTrend || []).map((item) => ({
                week: `W${item._id.week}`,
                total: item.total
              }))}
            >
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
