/**
 * Knowledge Base API Routes
 * Endpoints for managing the trading knowledge base
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { processDocument, addTradingKnowledge } from '../services/knowledgeBase.js';
import { searchDocuments, getStats, clearCollection } from '../services/vectorStore.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.docx', '.txt', '.md'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOCX, TXT, and MD files are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/knowledge/upload
 * Upload and process a trading document
 */
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { category = 'general', tags = '' } = req.body;
        const metadata = {
            category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            uploadedAt: new Date().toISOString()
        };

        const result = await processDocument(req.file.path, metadata);

        // Delete uploaded file after processing
        await fs.unlink(req.file.path);

        res.json({
            success: true,
            message: 'Document processed and added to knowledge base',
            ...result
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/knowledge/add
 * Add manual trading knowledge snippet
 */
router.post('/add', async (req, res) => {
    try {
        const { title, content, category = 'manual', tags = [] } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const metadata = { category, tags };
        const result = await addTradingKnowledge(title, content, metadata);

        res.json({
            success: true,
            message: 'Knowledge added successfully',
            ...result
        });
    } catch (error) {
        console.error('Add knowledge error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/knowledge/search?query=...&limit=5
 * Search knowledge base
 */
router.get('/search', async (req, res) => {
    try {
        const { query, limit = 5 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const results = await searchDocuments(query, parseInt(limit));

        res.json({
            success: true,
            query,
            resultsCount: results.length,
            results
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/knowledge/stats
 * Get knowledge base statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await getStats();
        res.json({ success: true, ...stats });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/knowledge/clear
 * Clear entire knowledge base (admin only - use carefully!)
 */
router.delete('/clear', async (req, res) => {
    try {
        const { confirm } = req.body;

        if (confirm !== 'DELETE_ALL') {
            return res.status(400).json({
                error: 'Confirmation required. Send {"confirm": "DELETE_ALL"}'
            });
        }

        await clearCollection();

        res.json({
            success: true,
            message: 'Knowledge base cleared'
        });
    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
