export interface PageReference {
  pageNumber?: number;
  rowNumber?: number;
  content: string;
}

export interface DocumentChunk {
  index: number;
  content: string;
  pageOrRowRef?: string;
  charCount: number;
}

export interface ProcessedDocument {
  text: string;
  chunkedContent: DocumentChunk[];
  metadata: {
    pageCount?: number;
    rowCount?: number;
    charCount: number;
    truncated: boolean;
    extractedAt: string;
    [key: string]: any;
  };
  references: PageReference[];
  warnings: string[];
  errors: string[];
}

export interface DocumentProcessor {
  supports(mimeType: string, extension: string): boolean;
  process(filePath: string, originalName?: string): Promise<ProcessedDocument>;
}
