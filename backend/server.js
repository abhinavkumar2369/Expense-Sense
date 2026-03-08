import express from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "expense-sense-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ml", mlRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
