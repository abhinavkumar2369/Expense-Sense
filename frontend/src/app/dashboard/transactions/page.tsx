/**
 * Transactions Page
 * ==================
 * Full CRUD interface for expense transactions.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, TransactionCreate, APIResponse, PaginatedData } from "@/types";
import Spinner from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, AlertTriangle, X } from "lucide-react";

const CATEGORIES = [
  "Food & Groceries",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Housing",
  "Education",
  "Income",
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFlagged, setFilterFlagged] = useState<string>("");

  // Form state
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formNote, setFormNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const LIMIT = 15;

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { skip: page * LIMIT, limit: LIMIT };
      if (filterCategory) params.category = filterCategory;
      if (filterFlagged === "true") params.flagged = true;
      if (filterFlagged === "false") params.flagged = false;

      const res = await api.get<APIResponse<PaginatedData<Transaction>>>("/transactions", { params });
      setTransactions(res.data.data.items);
      setTotal(res.data.data.total);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [page, filterCategory, filterFlagged]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const openCreate = () => {
    setEditingTxn(null);
    setFormAmount("");
    setFormDesc("");
    setFormCategory("");
    setFormNote("");
    setShowModal(true);
  };

  const openEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setFormAmount(txn.amount.toString());
    setFormDesc(txn.description);
    setFormCategory(txn.category);
    setFormNote(txn.note || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTxn) {
        await api.put(`/transactions/${editingTxn.id}`, {
          amount: parseFloat(formAmount),
          description: formDesc,
          category: formCategory || undefined,
          note: formNote || undefined,
        });
        toast.success("Transaction updated");
      } else {
        const payload: TransactionCreate = {
          amount: parseFloat(formAmount),
          description: formDesc,
          category: formCategory || undefined,
          note: formNote || undefined,
        };
        await api.post("/transactions", payload);
        toast.success("Transaction created");
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchTransactions();
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
          <p className="text-gray-500 text-sm mt-1">{total} total transactions</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterFlagged}
          onChange={(e) => { setFilterFlagged(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="true">Flagged Only</option>
          <option value="false">Normal Only</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner className="py-10" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(txn.created_at)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium max-w-[250px] truncate">{txn.description}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {txn.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {txn.is_flagged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <AlertTriangle size={12} /> Flagged
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(txn)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(txn.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTxn ? "Edit Transaction" : "New Transaction"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Grocery shopping at Walmart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-gray-400">(leave blank for AI auto-detect)</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">🤖 AI Auto-Detect</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note <span className="text-gray-400">(encrypted)</span>
                </label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Optional private note…"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving…" : editingTxn ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
