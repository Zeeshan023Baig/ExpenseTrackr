import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user budget
// @route   GET /api/budget
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ budget: user.budget || 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update user budget
// @route   PUT /api/budget
router.put('/', protect, async (req, res) => {
    try {
        const { budget } = req.body;

        if (budget === undefined || budget < 0) {
            return res.status(400).json({ message: 'Please provide a valid positive budget amount' });
        }

        const user = await User.findByPk(req.user.id);
        user.budget = budget; // Assuming we add a budget field to User model or separate table
        await user.save(); // Sequelize save

        res.json({ budget: user.budget });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
