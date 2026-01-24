const Expense = require('../models/Expense');
const { sequelize } = require('../config/db');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;

        if (!description || !amount || !category) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const expense = await Expense.create({
            userId: req.user.id,
            description,
            amount,
            category,
            date: date || new Date()
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
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

module.exports = {
    getExpenses,
    addExpense,
    deleteExpense,
    updateExpense,
    getExpenseStats
};
