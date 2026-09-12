import { DocumentProcessor, ProcessedDocument } from './processor.interface.js';
import { PdfProcessor } from './pdf.processor.js';
import { TxtProcessor } from './text.processor.js';
import { CsvProcessor } from './csv.processor.js';

export class ProcessorRegistry {
  private static processors: DocumentProcessor[] = [
    new PdfProcessor(),
    new TxtProcessor(),
    new CsvProcessor(),
  ];

  static getProcessor(mimeType: string, extension: string): DocumentProcessor {
    const processor = this.processors.find((p) => p.supports(mimeType, extension));
    if (!processor) {
      throw new Error(`No document processor registered for MIME type '${mimeType}' and extension '${extension}'`);
    }
    return processor;
  }

  static async processDocument(
    filePath: string,
    mimeType: string,
    originalName: string
  ): Promise<ProcessedDocument> {
    const ext = originalName.slice(originalName.lastIndexOf('.'));
    const processor = this.getProcessor(mimeType, ext);
    return await processor.process(filePath, originalName);
  }
}
