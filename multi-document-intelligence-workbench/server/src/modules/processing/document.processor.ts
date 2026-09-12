import { processPdf } from './pdf.processor.js';
import { processText } from './text.processor.js';
import { processCsv } from './csv.processor.js';

export async function extractDocumentText(filePath: string, mimeType: string, originalName: string): Promise<string> {
  const ext = originalName.toLowerCase().slice(originalName.lastIndexOf('.'));

  if (mimeType === 'application/pdf' || ext === '.pdf') {
    return await processPdf(filePath);
  }
  if (mimeType === 'text/plain' || ext === '.txt') {
    return await processText(filePath);
  }
  if (
    mimeType === 'text/csv' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'text/x-csv' ||
    mimeType === 'application/csv' ||
    ext === '.csv'
  ) {
    return await processCsv(filePath);
  }
  throw new Error(`Unsupported MIME type/extension: ${mimeType} (${ext})`);
}
