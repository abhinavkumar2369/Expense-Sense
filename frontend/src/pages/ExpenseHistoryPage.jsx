import { useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ExpenseTable from "../components/ExpenseTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { useExpenses } from "../hooks/useExpenses";
import { editExpense, removeExpense } from "../services/expenseService";

const ExpenseHistoryPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category: category || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }),
    [search, category, startDate, endDate]
  );

  const { expenses, loading, refresh, setFilters } = useExpenses(filters);

  const applyFilters = () => setFilters(filters);

  const onDelete = async (id) => {
    await removeExpense(id);
    refresh();
  };

  const onEdit = async (expense) => {
    const amount = window.prompt("Update amount", String(expense.amount));
    if (amount === null) return;

    const description = window.prompt("Update description", expense.description || "");
    if (description === null) return;

    const date = window.prompt("Update date (YYYY-MM-DD)", String(expense.date).slice(0, 10));
    if (date === null) return;

    await editExpense(expense._id, {
      amount: Number(amount),
      description,
      date
    });

    refresh();
  };

  return (
    <DashboardLayout>
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-card grid gap-3 md:grid-cols-5">
        <input
          placeholder="Search description"
          className="rounded-lg border border-slate-300 p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Others">Others</option>
        </select>
        <input type="date" className="rounded-lg border border-slate-300 p-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className="rounded-lg border border-slate-300 p-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={applyFilters} className="rounded-lg bg-brand-500 text-white hover:bg-brand-700 px-3 py-2">Apply</button>
      </div>

      {loading ? <LoadingSpinner /> : <ExpenseTable expenses={expenses} onDelete={onDelete} onEdit={onEdit} />}
    </DashboardLayout>
  );
};

export default ExpenseHistoryPage;
