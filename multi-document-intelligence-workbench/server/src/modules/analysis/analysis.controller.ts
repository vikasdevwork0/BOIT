import { Request, Response } from 'express';
import { CreateAnalysisSchema } from './analysis.types.js';
import { AnalysisService } from './analysis.service.js';

export class AnalysisController {
  static async createAnalysis(req: Request, res: Response) {
    try {
      const parseResult = CreateAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
          },
        });
      }

      const analysis = await AnalysisService.runAnalysis(parseResult.data);
      return res.status(201).json(analysis);
    } catch (error: any) {
      const isNotFound = error.message && error.message.includes('not found');
      return res.status(isNotFound ? 404 : 400).json({
        error: {
          code: isNotFound ? 'NOT_FOUND' : 'INVALID_DOCUMENT',
          message: error.message || 'An error occurred during multi-document analysis.',
        },
      });
    }
  }

  static async getAnalysisById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analysis = await AnalysisService.getAnalysisById(id);

      if (!analysis) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Analysis record with ID '${id}' was not found.`,
          },
        });
      }

      return res.json(analysis);
    } catch (error: any) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve analysis record.',
        },
      });
    }
  }

  static async getAllAnalyses(_req: Request, res: Response) {
    try {
      const analyses = await AnalysisService.listAnalyses();
      return res.json(analyses);
    } catch (error: any) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list analysis records.',
        },
      });
    }
  }
}
