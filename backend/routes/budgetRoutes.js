import express from "express";
import { getBudgetStatus, setBudget } from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getBudgetStatus).post(setBudget);

export default router;
