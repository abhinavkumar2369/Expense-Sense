import { spawn } from "child_process";
import path from "path";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

export const getInsights = async (req, res) => {
  const expenses = await Expense.find({ userId: req.user._id }).sort({ date: 1 }).lean();
  const budget = await Budget.findOne({ userId: req.user._id }).lean();

  if (!expenses.length) {
    return res.json({
      message: "Not enough expense data for ML insights yet",
      prediction: null,
      insights: []
    });
  }

  const payload = {
    expenses: expenses.map((item) => ({
      amount: item.amount,
      category: item.category,
      description: item.description,
      date: item.date
    })),
    monthlyBudget: budget?.monthlyBudget || 0
  };

  const pythonBin = process.env.ML_PYTHON_BIN || "python3";
  const scriptPath = path.resolve(process.cwd(), process.env.ML_PREDICT_SCRIPT || "../ml-model/predict.py");

  const py = spawn(pythonBin, [scriptPath, JSON.stringify(payload)]);

  let stdout = "";
  let stderr = "";

  py.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  py.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        message: "ML module execution failed",
        error: stderr || "Unknown error"
      });
    }

    try {
      const result = JSON.parse(stdout);
      return res.json(result);
    } catch (_error) {
      return res.status(500).json({
        message: "Failed to parse ML response",
        error: stdout
      });
    }
  });
};
