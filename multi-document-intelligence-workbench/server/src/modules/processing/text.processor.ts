import fs from 'fs/promises';

export async function processText(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf-8');
  return content.trim();
}
