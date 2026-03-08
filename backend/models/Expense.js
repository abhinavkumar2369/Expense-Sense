import mongoose from "mongoose";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Healthcare",
  "Others"
];

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      default: "Others",
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
