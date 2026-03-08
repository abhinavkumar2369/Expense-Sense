import express from "express";
import { getInsights } from "../controllers/mlController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/insights", getInsights);

export default router;
