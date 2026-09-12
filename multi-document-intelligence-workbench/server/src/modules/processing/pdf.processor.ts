import fs from 'fs/promises';
import * as pdfParseModule from 'pdf-parse';
import { DocumentProcessor, ProcessedDocument, PageReference } from './processor.interface.js';
import { createDocumentChunks } from './chunker.util.js';

export class PdfProcessor implements DocumentProcessor {
  supports(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase();
    return mimeType === 'application/pdf' || ext === '.pdf';
  }

  async process(filePath: string, originalName?: string): Promise<ProcessedDocument> {
    const warnings: string[] = [];
    const errors: string[] = [];
    const references: PageReference[] = [];
    let pageCount = 0;
    let fullText = '';

    try {
      const dataBuffer = await fs.readFile(filePath);
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;

      if (typeof pdfParse === 'function') {
        const options = {
          pagerender: (pageData: any) => {
            return pageData.getTextContent().then((textContent: any) => {
              let lastY: number | undefined, pageText = '';
              for (const item of textContent.items) {
                if (lastY === item.transform[5] || !lastY) {
                  pageText += item.str;
                } else {
                  pageText += '\n' + item.str;
                }
                lastY = item.transform[5];
              }
              const pageNum = pageData.pageIndex + 1;
              if (pageText.trim()) {
                references.push({
                  pageNumber: pageNum,
                  content: pageText.trim(),
                });
              }
              return `--- Page ${pageNum} ---\n${pageText}`;
            });
          },
        };

        const parsed = await pdfParse(dataBuffer, options);
        pageCount = parsed.numpages || references.length || 1;
        fullText = parsed.text ? parsed.text.trim() : '';
      }

      // Stream fallback if standard pdfParse yields no text
      if (!fullText) {
        const rawContent = dataBuffer.toString('utf-8');
        const matches = rawContent.match(/\(([^)]+)\)\s*Tj/g);
        if (matches && matches.length > 0) {
          fullText = matches.map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')).join('\n');
          warnings.push('Extracted text using PDF raw stream fallback.');
        } else {
          fullText = rawContent
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (fullText) {
            warnings.push('Extracted text using printable ASCII fallback.');
          }
        }
      }

      if (!fullText || fullText === 'No readable text extracted') {
        throw new Error(`PDF file '${originalName || 'document'}' contains no readable text or is corrupted.`);
      }

      const { chunks, truncated, charCount } = createDocumentChunks(fullText, references);

      return {
        text: fullText,
        chunkedContent: chunks,
        metadata: {
          pageCount,
          charCount,
          truncated,
          extractedAt: new Date().toISOString(),
        },
        references,
        warnings,
        errors,
      };
    } catch (err: any) {
      const errorMessage = `Unreadable PDF document: ${err.message || 'Parsing failed'}`;
      errors.push(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
