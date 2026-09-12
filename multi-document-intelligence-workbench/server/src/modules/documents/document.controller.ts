import { Request, Response } from 'express';
import { DocumentService } from './document.service.js';

export class DocumentController {
  static async uploadDocuments(req: Request, res: Response) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];

      if (!files || files.length === 0) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No files provided in upload request.',
          },
          documents: [],
          errors: [{ originalName: 'N/A', message: 'No files provided in request.' }],
        });
      }

      const result = await DocumentService.processUploadedFiles(files);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        error: {
          code: 'INVALID_DOCUMENT',
          message: error.message || 'Internal server error during document upload.',
        },
        documents: [],
        errors: [{ originalName: 'N/A', message: error.message || 'Upload failed' }],
      });
    }
  }

  static async getAllDocuments(_req: Request, res: Response) {
    try {
      const documents = await DocumentService.listAllDocuments();
      return res.json(documents);
    } catch (error: any) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to list documents.',
        },
      });
    }
  }

  static async getDocumentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Document with ID '${id}' was not found.`,
          },
        });
      }
      return res.json(document);
    } catch (error: any) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve document details.',
        },
      });
    }
  }

  static async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await DocumentService.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Document with ID '${id}' was not found for deletion.`,
          },
        });
      }
      return res.json({ success: true, id });
    } catch (error: any) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete document.',
        },
      });
    }
  }
}
