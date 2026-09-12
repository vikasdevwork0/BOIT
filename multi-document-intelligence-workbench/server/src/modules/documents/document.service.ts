import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../config/upload.config.js';
import { ProcessorRegistry } from '../processing/processor.registry.js';
import { ProcessedDocument } from '../processing/processor.interface.js';
import { UploadedDocumentResult, UploadErrorResult, UploadApiResponse } from './document.types.js';

const prisma = new PrismaClient();

export class DocumentService {
  static async processUploadedFiles(files: Express.Multer.File[]): Promise<UploadApiResponse> {
    const documents: UploadedDocumentResult[] = [];
    const errors: UploadErrorResult[] = [];

    for (const file of files) {
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

        // 1. Initial DB status: uploaded
        let docRecord = await prisma.document.create({
          data: {
            originalName,
            storedName: file.filename,
            mimeType,
            fileSize: file.size,
            status: 'uploaded',
          },
        });

        // 2. Transition status: processing
        docRecord = await prisma.document.update({
          where: { id: docRecord.id },
          data: { status: 'processing' },
        });

        // 3. Process with ProcessorRegistry
        try {
          const processedDoc: ProcessedDocument = await ProcessorRegistry.processDocument(
            file.path,
            mimeType,
            originalName
          );

          // 4a. Transition status: processed
          docRecord = await prisma.document.update({
            where: { id: docRecord.id },
            data: {
              status: 'processed',
              extractedText: processedDoc.text,
            },
          });

          documents.push({
            id: docRecord.id,
            originalName: docRecord.originalName,
            mimeType: docRecord.mimeType,
            status: docRecord.status,
            fileSize: docRecord.fileSize,
            metadata: processedDoc.metadata,
            warnings: processedDoc.warnings,
          });
        } catch (procErr: any) {
          // 4b. Transition status: failed
          docRecord = await prisma.document.update({
            where: { id: docRecord.id },
            data: {
              status: 'failed',
              extractedText: null,
            },
          });

          errors.push({
            originalName,
            message: procErr.message || 'Processing failed for document.',
          });
        }
      } catch (err: any) {
        await fs.unlink(file.path).catch(() => {});
        errors.push({
          originalName,
          message: err.message || 'Failed to initialize file upload',
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
        extractedText: true,
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
