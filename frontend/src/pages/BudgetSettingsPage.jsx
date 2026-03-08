import { useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import { fetchBudgetStatus, setMonthlyBudget } from "../services/budgetService";

const BudgetSettingsPage = () => {
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [monthlyBudget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  const loadStatus = async () => {
    const data = await fetchBudgetStatus();
    setBudgetStatus(data);
    setBudget(String(data.monthlyBudget || ""));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await setMonthlyBudget(Number(monthlyBudget));
    await loadStatus();
    setMessage("Budget updated successfully");
  };

  const chartData = [
    { name: "Budget", value: budgetStatus?.monthlyBudget || 0 },
    { name: "Spent", value: budgetStatus?.spent || 0 }
  ];

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-card space-y-4">
          <h2 className="font-heading text-xl">Monthly Budget</h2>
          {message && <p className="text-sm text-brand-700">{message}</p>}
          <input
            type="number"
            min="0"
            value={monthlyBudget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3"
            placeholder="Enter monthly budget"
            required
          />
          <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-700">
            Save Budget
          </button>
          {budgetStatus?.exceeded && (
            <p className="text-red-600 font-semibold">Warning: You have exceeded your monthly budget.</p>
          )}
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-card h-96">
          <h3 className="font-heading mb-2">Budget vs Actual Spending</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BudgetSettingsPage;
