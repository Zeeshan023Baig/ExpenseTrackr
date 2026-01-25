import express from 'express';
import { getExpenseStats } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/category', protect, getExpenseStats);
router.get('/monthly', protect, getExpenseStats); // For now redirecting to same stats or implement specific monthly logic if needed

export default router;
