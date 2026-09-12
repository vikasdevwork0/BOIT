import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../config/upload.config.js';
import { extractDocumentText } from '../processing/document.processor.js';
import { UploadedDocumentResult, UploadErrorResult, UploadApiResponse } from './document.types.js';

const prisma = new PrismaClient();

export class DocumentService {
  static async processUploadedFiles(files: Express.Multer.File[]): Promise<UploadApiResponse> {
    const documents: UploadedDocumentResult[] = [];
    const errors: UploadErrorResult[] = [];

    for (const file of files) {
      // Prevent path traversal by extracting clean basename
      const originalName = path.basename(file.originalname);
      const mimeType = file.mimetype;
      const ext = path.extname(originalName).toLowerCase();

      try {
        // Validate MIME type / extension
        const isMimeAllowed = Boolean(ALLOWED_MIME_TYPES[mimeType]);
        const isExtAllowed = ['.pdf', '.txt', '.csv'].includes(ext);

        if (!isMimeAllowed && !isExtAllowed) {
          await fs.unlink(file.path).catch(() => {});
          errors.push({
            originalName,
            message: `Unsupported file type: ${mimeType || ext}. Supported types: PDF, TXT, CSV.`,
          });
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          await fs.unlink(file.path).catch(() => {});
          errors.push({
            originalName,
            message: `File size exceeds limit (${(MAX_FILE_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB max). Received ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
          });
          continue;
        }

        // Extract Text
        let extractedText = '';
        let status = 'uploaded';
        try {
          extractedText = await extractDocumentText(file.path, mimeType, originalName);
          status = 'processed';
        } catch (err: any) {
          console.warn(`Extraction warning for ${originalName}:`, err?.message);
          status = 'extraction_failed';
        }

        // Save record to DB
        const docRecord = await prisma.document.create({
          data: {
            originalName,
            storedName: file.filename,
            mimeType,
            fileSize: file.size,
            status,
            extractedText,
          },
        });

        documents.push({
          id: docRecord.id,
          originalName: docRecord.originalName,
          mimeType: docRecord.mimeType,
          status: docRecord.status,
          fileSize: docRecord.fileSize,
        });
      } catch (err: any) {
        // Clean up file if error occurs
        await fs.unlink(file.path).catch(() => {});
        errors.push({
          originalName,
          message: err.message || 'Failed to process file',
        });
      }
    }

    return { documents, errors };
  }

  static async listAllDocuments() {
    return prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        storedName: true,
        mimeType: true,
        fileSize: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async getDocumentById(id: string) {
    return prisma.document.findUnique({
      where: { id },
    });
  }
}
