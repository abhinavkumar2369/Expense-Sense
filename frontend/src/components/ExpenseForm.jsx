import { useState } from "react";
import { addExpense } from "../services/expenseService";

const categories = ["Food", "Travel", "Shopping", "Bills", "Healthcare", "Others"];

const ExpenseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "Food",
    description: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      setFormData((prev) => ({ ...prev, amount: "", description: "" }));
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
      <h2 className="font-heading text-xl">Add New Expense</h2>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={onChange}
          required
          min="0"
          className="rounded-lg border border-slate-300 p-3"
        />
        <select
          name="category"
          value={formData.category}
          onChange={onChange}
          className="rounded-lg border border-slate-300 p-3"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 p-3"
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 p-3"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-700 transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add Expense"}
      </button>
    </form>
  );
};

export default ExpenseForm;
