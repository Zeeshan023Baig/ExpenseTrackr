const express = require('express');
const router = express.Router();
const { getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/category', protect, getExpenseStats);
router.get('/monthly', protect, getExpenseStats); // For now redirecting to same stats or implement specific monthly logic if needed

module.exports = router;
