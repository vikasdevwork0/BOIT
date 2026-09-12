import fs from 'fs/promises';
import { DocumentProcessor, ProcessedDocument, PageReference } from './processor.interface.js';
import { createDocumentChunks } from './chunker.util.js';

export class TxtProcessor implements DocumentProcessor {
  supports(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase();
    return mimeType === 'text/plain' || ext === '.txt';
  }

  async process(filePath: string, originalName?: string): Promise<ProcessedDocument> {
    const warnings: string[] = [];
    const errors: string[] = [];
    const references: PageReference[] = [];

    try {
      const fullText = (await fs.readFile(filePath, 'utf-8')).trim();

      if (!fullText) {
        warnings.push('TXT document is empty.');
      }

      const lines = fullText.split('\n');
      lines.forEach((line, index) => {
        if (line.trim()) {
          references.push({
            rowNumber: index + 1,
            content: line.trim(),
          });
        }
      });

      const { chunks, truncated, charCount } = createDocumentChunks(fullText, references);

      return {
        text: fullText,
        chunkedContent: chunks,
        metadata: {
          lineCount: lines.length,
          charCount,
          truncated,
          extractedAt: new Date().toISOString(),
        },
        references,
        warnings,
        errors,
      };
    } catch (err: any) {
      const errorMessage = `Failed to read TXT document '${originalName || 'file'}': ${err.message}`;
      errors.push(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
