import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { userId: req.user.id },
            order: [['name', 'ASC']]
        });

        // Default categories if user has none
        const defaults = [
            'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Subscription', 'Other'
        ];

        if (categories.length === 0) {
            return res.json(defaults);
        }

        // Merge defaults with custom ones, ensuring uniqueness
        const userCats = categories.map(c => c.name);
        const combined = [...new Set([...defaults, ...userCats])];

        res.json(combined);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name is required' });

        const existing = await Category.findOne({
            where: { name, userId: req.user.id }
        });

        if (existing) return res.status(400).json({ message: 'Category already exists' });

        const category = await Category.create({
            name,
            userId: req.user.id
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category' });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { name } = req.params;
        const result = await Category.destroy({
            where: { name, userId: req.user.id }
        });

        if (result === 0) return res.status(404).json({ message: 'Category not found' });

        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category' });
    }
};
