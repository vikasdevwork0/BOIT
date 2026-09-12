import { Router } from 'express';
import { AnalysisController } from './analysis.controller.js';

const router = Router();

// POST /api/analysis
router.post('/', AnalysisController.createAnalysis);

// GET /api/analysis
router.get('/', AnalysisController.getAllAnalyses);

// GET /api/analysis/:id
router.get('/:id', AnalysisController.getAnalysisById);

export default router;
