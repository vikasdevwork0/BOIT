import { DocumentChunk, PageReference } from './processor.interface.js';

export const MAX_DOCUMENT_CHAR_LIMIT = 50000; // Max 50,000 characters per document
export const DEFAULT_CHUNK_SIZE = 2000; // 2,000 characters per chunk

export function createDocumentChunks(
  text: string,
  references: PageReference[] = []
): { chunks: DocumentChunk[]; truncated: boolean; charCount: number } {
  const originalCharCount = text.length;
  let processedText = text;
  let truncated = false;

  if (originalCharCount > MAX_DOCUMENT_CHAR_LIMIT) {
    processedText = text.slice(0, MAX_DOCUMENT_CHAR_LIMIT);
    truncated = true;
  }

  const chunks: DocumentChunk[] = [];
  let currentIndex = 0;
  let chunkCounter = 0;

  while (currentIndex < processedText.length) {
    const end = Math.min(currentIndex + DEFAULT_CHUNK_SIZE, processedText.length);
    const chunkText = processedText.slice(currentIndex, end);

    let pageOrRowRef = `Chars ${currentIndex}-${end}`;
    if (references.length > 0) {
      const matchedRef = references.find(
        (ref) => ref.content && chunkText.includes(ref.content.slice(0, 30))
      );
      if (matchedRef) {
        if (matchedRef.pageNumber) pageOrRowRef = `Page ${matchedRef.pageNumber}`;
        if (matchedRef.rowNumber) pageOrRowRef = `Row ${matchedRef.rowNumber}`;
      }
    }

    chunks.push({
      index: chunkCounter,
      content: chunkText,
      pageOrRowRef,
      charCount: chunkText.length,
    });

    currentIndex = end;
    chunkCounter++;
  }

  return {
    chunks,
    truncated,
    charCount: processedText.length,
  };
}
