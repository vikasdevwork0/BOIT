import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

export async function processCsv(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');
  const records = parse(content, {
    skip_empty_lines: true,
    trim: true,
  });
  return JSON.stringify(records, null, 2);
}
