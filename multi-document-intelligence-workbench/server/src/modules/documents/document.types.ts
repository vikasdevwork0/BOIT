import { z } from 'zod';

export interface UploadedDocumentResult {
  id: string;
  originalName: string;
  mimeType: string;
  status: string;
  fileSize: number;
}

export interface UploadErrorResult {
  originalName: string;
  message: string;
}

export interface UploadApiResponse {
  documents: UploadedDocumentResult[];
  errors: UploadErrorResult[];
}

export const UploadRequestQuerySchema = z.object({
  extractText: z.enum(['true', 'false']).optional(),
});
