import { ProcessorRegistry } from './processor.registry.js';
import { ProcessedDocument } from './processor.interface.js';

export async function extractDocumentText(
  filePath: string,
  mimeType: string,
  originalName: string
): Promise<ProcessedDocument> {
  return await ProcessorRegistry.processDocument(filePath, mimeType, originalName);
}

export * from './processor.interface.js';
export * from './processor.registry.js';
