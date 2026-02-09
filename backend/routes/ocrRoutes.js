import express from 'express';
import multer from 'multer';
import { scanReceipts } from '../services/ocrService.js';
import fs from 'fs';

const router = express.Router();

// Multer Config (Temp storage)
const upload = multer({ dest: 'uploads/' });

router.post('/scan', upload.array('images', 5), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
    }

    const filePaths = req.files.map(file => file.path);

    try {
        const filesData = req.files.map(file => ({
            path: file.path,
            mimetype: file.mimetype
        }));

        const result = await scanReceipts(filesData);

        // Cleanup temp files
        filePaths.forEach(path => {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        });

        res.json(result);
    } catch (error) {
        // Cleanup on error too
        filePaths.forEach(path => {
            if (fs.existsSync(path)) fs.unlinkSync(path);
        });

        res.status(500).json({ message: error.message });
    }
});

export default router;
