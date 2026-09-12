import fs from 'fs/promises';
import * as pdfParseModule from 'pdf-parse';

export async function processPdf(filePath: string): Promise<string> {
  const dataBuffer = await fs.readFile(filePath);
  try {
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    if (typeof pdfParse === 'function') {
      const parsed = await pdfParse(dataBuffer);
      if (parsed && parsed.text && parsed.text.trim()) {
        return parsed.text.trim();
      }
    }
  } catch (err: any) {
    console.warn('pdf-parse fallback triggered:', err?.message);
  }

  // Fallback text extractor for raw PDF streams
  const rawContent = dataBuffer.toString('utf-8');
  const matches = rawContent.match(/\(([^)]+)\)\s*Tj/g);
  if (matches && matches.length > 0) {
    return matches.map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')).join('\n');
  }

  const printableText = rawContent
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return printableText || 'No readable text extracted';
}
