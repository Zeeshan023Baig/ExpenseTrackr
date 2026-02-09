import Expense from '../models/Expense.js';
import { sequelize } from '../config/db.js';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        console.log('Fetching expenses for user:', req.user.id);
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        console.log('[DEBUG] addExpense payload:', req.body);
        const { description, amount, category, date } = req.body;

        if (!description || !amount || !category) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        console.log('Creating expense for user:', req.user?.id);

        const expense = await Expense.create({
            userId: req.user.id,
            description,
            amount,
            category,
            date: date || new Date()
        });

        console.log('Expense created:', expense.toJSON());

        res.status(201).json(expense);
    } catch (error) {
        console.error('Error adding expense:', error);
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ message: `Server Error: ${error.message}`, error: error.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await expense.destroy();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await expense.update(req.body);

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get stats
// @route   GET /api/expenses/stats
// @access  Private
const getExpenseStats = async (req, res) => {
    try {
        const stats = await Expense.findAll({
            where: { userId: req.user.id },
            attributes: [
                'category',
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: ['category']
        });
        res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get daily trend stats (last 30 days)
// @route   GET /api/expenses/trend
// @access  Private
const getExpenseTrend = async (req, res) => {
    try {
        const stats = await Expense.findAll({
            where: {
                userId: req.user.id,
                date: {
                    [sequelize.Op.gte]: sequelize.literal("DATE_SUB(NOW(), INTERVAL 30 DAY)")
                }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date')), 'day'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            group: [sequelize.fn('DATE', sequelize.col('date'))],
            order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']]
        });
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching trend:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    getExpenses,
    getExpenseById,
    addExpense,
    deleteExpense,
    updateExpense,
    getExpenseStats,
    getExpenseTrend
};
