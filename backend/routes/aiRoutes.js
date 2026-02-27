import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { predictExpenses } from '../services/aiService.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/predict', protect, async (req, res) => {
    try {
        // Fetch the user to get their set budget
        const user = await User.findByPk(req.user.id);
        const budget = user?.budget || 0;

        // Fetch all expenses for the user to provide context
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });

        if (expenses.length < 5) {
            return res.status(400).json({
                message: 'Not enough data for AI prediction. Please add at least 5 expenses.'
            });
        }

        const prediction = await predictExpenses(expenses, budget);
        res.json(prediction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
