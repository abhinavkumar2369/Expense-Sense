import Expense, { EXPENSE_CATEGORIES } from "../models/Expense.js";

const buildExpenseFilters = (query, userId) => {
  const filters = { userId };

  if (query.category) {
    filters.category = query.category;
  }

  if (query.search) {
    filters.description = { $regex: query.search, $options: "i" };
  }

  if (query.startDate || query.endDate) {
    filters.date = {};
    if (query.startDate) filters.date.$gte = new Date(query.startDate);
    if (query.endDate) filters.date.$lte = new Date(query.endDate);
  }

  return filters;
};

export const createExpense = async (req, res) => {
  const { amount, category, description, date } = req.body;

  if (amount === undefined || !category || !date) {
    return res.status(400).json({ message: "Amount, category and date are required" });
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  const expense = await Expense.create({
    userId: req.user._id,
    amount,
    category,
    description: description || "",
    date
  });

  return res.status(201).json(expense);
};

export const getExpenses = async (req, res) => {
  const filters = buildExpenseFilters(req.query, req.user._id);
  const expenses = await Expense.find(filters).sort({ date: -1 });
  return res.json(expenses);
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;

  const expense = await Expense.findOne({ _id: id, userId: req.user._id });
  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  if (category && !EXPENSE_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  if (amount !== undefined) expense.amount = amount;
  if (category) expense.category = category;
  if (description !== undefined) expense.description = description;
  if (date) expense.date = date;

  const updatedExpense = await expense.save();
  return res.json(updatedExpense);
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user._id });
  if (!expense) {
    return res.status(404).json({ message: "Expense not found" });
  }

  return res.json({ message: "Expense deleted" });
};

export const getExpenseSummary = async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthlyTotalResult, categoryWise, weeklyTrend] = await Promise.all([
    Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]),
    Expense.aggregate([
      { $match: { userId, date: { $gte: monthStart } } },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$date" },
            year: { $isoWeekYear: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ])
  ]);

  return res.json({
    monthlyTotal: monthlyTotalResult[0]?.total || 0,
    categoryWise,
    weeklyTrend
  });
};
