import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all category routes

router.get('/', getCategories);
router.post('/', createCategory);
router.delete('/:name', deleteCategory);

export default router;
