import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    monthlyBudget: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
