import express from "express";
import { getExpenses, addExpense, deleteExpense, updateExpense, getExpenseById } from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getExpenses);
router.post("/", protect, addExpense);
router.get("/:id", protect, getExpenseById);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);

export default router;
