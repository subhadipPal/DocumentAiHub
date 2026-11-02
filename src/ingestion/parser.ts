import fs from 'fs/promises';
import path from 'path';
import { RawTextBlock } from '../types/chunk';

/**
 * Parses a Markdown file into RawText blocks based on headers and structural elements.
 *
 * @param filePath - The absolute path to the Markdown file.
 * @returns A promise of RawText blocks.
 */
export async function parseMarkdown(filePath: string): Promise<RawTextBlock[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Regex to split by headers (H1-H6) while keeping the header in the result
    // This uses a lookbehind to keep the separator
    const sections = content.split(/(?<=\n)#{1,6}\s+/);

    const results: RawTextBlock[] = [];

    sections.forEach((section, index) => {
      const trimmed = section.trim();
      if (trimmed.length > 0) {
        results.push({
          text: trimmed,
          metadata: {
            source: filePath,
            sectionIndex: index,
            // Extract title from the first line if it's a header
            title: trimmed.match(/^(#{1,6})\s+(.*)$/)?.[2]?.trim() || 'Untitled Section'
          }
        });
      }
    });

    return results;
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error);
    throw error;
  }
}
