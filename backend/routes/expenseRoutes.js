import express from "express";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createExpense).get(getExpenses);
router.get("/summary", getExpenseSummary);
router.route("/:id").put(updateExpense).delete(deleteExpense);

export default router;
