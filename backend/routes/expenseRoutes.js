const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense, updateExpense, getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getExpenses)
    .post(protect, addExpense);

router.get('/stats', protect, getExpenseStats); // Specific routes before parameters

router.route('/:id')
    .delete(protect, deleteExpense)
    .put(protect, updateExpense);

module.exports = router;
