import express from "express";
import { getExpenses, addExpense, deleteExpense, updateExpense, getExpenseById, getExpenseStats, getExpenseTrend } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getExpenses);
router.post("/", protect, addExpense);
router.get("/stats", protect, getExpenseStats);
router.get("/trend", protect, getExpenseTrend);
router.get("/:id", protect, getExpenseById);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);

export default router;
