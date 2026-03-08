import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

const ExpenseTable = ({ expenses, onDelete, onEdit }) => {
  if (!expenses.length) {
    return <p className="text-slate-600">No expenses found for the selected filters.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id} className="border-b border-slate-100">
              <td className="px-4 py-3">{format(new Date(expense.date), "dd MMM yyyy")}</td>
              <td className="px-4 py-3">{expense.category}</td>
              <td className="px-4 py-3">{expense.description || "-"}</td>
              <td className="px-4 py-3 font-semibold">${expense.amount.toFixed(2)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-amber-700 hover:bg-amber-100"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense._id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
