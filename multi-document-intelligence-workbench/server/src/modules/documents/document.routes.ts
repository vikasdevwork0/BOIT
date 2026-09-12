import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadMiddleware } from '../../config/upload.config.js';
import { DocumentController } from './document.controller.js';

const router = Router();

const handleUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const uploadHandler = uploadMiddleware.array('files', 10);
  uploadHandler(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            documents: [],
            errors: [{ originalName: 'upload_batch', message: 'File size exceeds the 10MB limit.' }],
          });
        }
        return res.status(400).json({
          documents: [],
          errors: [{ originalName: 'upload_batch', message: `Multer upload error: ${err.message}` }],
        });
      }
      return res.status(400).json({
        documents: [],
        errors: [{ originalName: 'upload_batch', message: err.message || 'File upload error' }],
      });
    }
    next();
  });
};

// POST /api/documents/upload
router.post('/upload', handleUploadMiddleware, DocumentController.uploadDocuments);

// GET /api/documents
router.get('/', DocumentController.getAllDocuments);

// GET /api/documents/:id
router.get('/:id', DocumentController.getDocumentById);

// DELETE /api/documents/:id
router.delete('/:id', DocumentController.deleteDocument);

export default router;
