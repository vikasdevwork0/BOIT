import { Request, Response } from 'express';
import { DocumentService } from './document.service.js';

export class DocumentController {
  static async uploadDocuments(req: Request, res: Response) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];

      if (!files || files.length === 0) {
        return res.status(400).json({
          documents: [],
          errors: [{ originalName: 'N/A', message: 'No files provided in request.' }],
        });
      }

      const result = await DocumentService.processUploadedFiles(files);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        documents: [],
        errors: [{ originalName: 'N/A', message: error.message || 'Internal server error during upload' }],
      });
    }
  }

  static async getAllDocuments(_req: Request, res: Response) {
    try {
      const documents = await DocumentService.listAllDocuments();
      return res.json(documents);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getDocumentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await DocumentService.getDocumentById(id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      return res.json(document);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
