import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { DocumentProcessor, ProcessedDocument, PageReference } from './processor.interface.js';
import { createDocumentChunks } from './chunker.util.js';

export class CsvProcessor implements DocumentProcessor {
  supports(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase();
    return (
      mimeType === 'text/csv' ||
      mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'text/x-csv' ||
      mimeType === 'application/csv' ||
      ext === '.csv'
    );
  }

  async process(filePath: string, originalName?: string): Promise<ProcessedDocument> {
    const warnings: string[] = [];
    const errors: string[] = [];
    const references: PageReference[] = [];

    try {
      const rawContent = await fs.readFile(filePath, 'utf-8');

      let records: string[][] = [];
      try {
        records = parse(rawContent, {
          skip_empty_lines: true,
          trim: true,
        });
      } catch (err: any) {
        warnings.push(`CSV parsing warning: ${err.message}. Falling back to raw line splitting.`);
        records = rawContent.split('\n').map((line) => line.split(','));
      }

      if (records.length === 0) {
        warnings.push('CSV document is empty.');
      }

      const headers = records.length > 0 ? records[0] : [];
      const textLines: string[] = [];

      if (headers.length > 0) {
        textLines.push(`CSV Headers: [ ${headers.join(' | ')} ]\n--- Data Rows ---`);
      }

      for (let i = 1; i < records.length; i++) {
        const row = records[i];
        let formattedRow = `Row ${i}: `;
        if (headers.length === row.length) {
          formattedRow += headers.map((h, colIdx) => `${h}=${row[colIdx]}`).join(', ');
        } else {
          formattedRow += row.join(', ');
        }

        textLines.push(formattedRow);
        references.push({
          rowNumber: i,
          content: formattedRow,
        });
      }

      const fullText = textLines.join('\n');
      const { chunks, truncated, charCount } = createDocumentChunks(fullText, references);

      return {
        text: fullText,
        chunkedContent: chunks,
        metadata: {
          rowCount: Math.max(0, records.length - 1),
          columnCount: headers.length,
          headers,
          charCount,
          truncated,
          extractedAt: new Date().toISOString(),
        },
        references,
        warnings,
        errors,
      };
    } catch (err: any) {
      const errorMessage = `Failed to process CSV document '${originalName || 'file'}': ${err.message}`;
      errors.push(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
