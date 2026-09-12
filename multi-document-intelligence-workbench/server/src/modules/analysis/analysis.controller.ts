import { Request, Response } from 'express';
import { CreateAnalysisSchema } from './analysis.types.js';
import { AnalysisService } from './analysis.service.js';

export class AnalysisController {
  static async createAnalysis(req: Request, res: Response) {
    try {
      const parseResult = CreateAnalysisSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: 'Invalid analysis request format',
          errors: parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
        });
      }

      const analysis = await AnalysisService.runAnalysis(parseResult.data);
      return res.status(201).json(analysis);
    } catch (error: any) {
      console.error('Analysis creation error:', error);
      return res.status(500).json({
        message: error.message || 'An error occurred during multi-document analysis.',
      });
    }
  }

  static async getAnalysisById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analysis = await AnalysisService.getAnalysisById(id);

      if (!analysis) {
        return res.status(404).json({ message: `Analysis with ID '${id}' not found.` });
      }

      return res.json(analysis);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getAllAnalyses(_req: Request, res: Response) {
    try {
      const analyses = await AnalysisService.listAnalyses();
      return res.json(analyses);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
