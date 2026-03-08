import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";

export const setBudget = async (req, res) => {
  const { monthlyBudget } = req.body;

  if (monthlyBudget === undefined || monthlyBudget < 0) {
    return res.status(400).json({ message: "Valid monthly budget is required" });
  }

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user._id },
    { monthlyBudget },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json(budget);
};

export const getBudgetStatus = async (req, res) => {
  const budget = await Budget.findOne({ userId: req.user._id });
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const spendResult = await Expense.aggregate([
    { $match: { userId: req.user._id, date: { $gte: monthStart } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const spent = spendResult[0]?.total || 0;
  const monthlyBudget = budget?.monthlyBudget || 0;

  return res.json({
    monthlyBudget,
    spent,
    remaining: Math.max(monthlyBudget - spent, 0),
    exceeded: monthlyBudget > 0 ? spent > monthlyBudget : false,
    percentageUsed: monthlyBudget > 0 ? Number(((spent / monthlyBudget) * 100).toFixed(2)) : 0
  });
};
