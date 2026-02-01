import express from 'express';
import multer from 'multer';
import { scanReceipt } from '../services/ocrService.js';
import fs from 'fs';

const router = express.Router();

// Multer Config (Temp storage)
const upload = multer({ dest: 'uploads/' });

router.post('/scan', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }

    try {
        const result = await scanReceipt(req.file.path, req.file.mimetype);

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.json(result);
    } catch (error) {
        // Cleanup on error too
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(500).json({ message: error.message });
    }
});

export default router;
