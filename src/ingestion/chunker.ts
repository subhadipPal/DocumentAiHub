import { RawTextBlock } from '../types/chunk';

/**
 * Chunks a text block into smaller segments based on size and overlap.
 *
 * @param text - The raw text from a section.
 * @param maxTokens - The maximum number of "tokens" (characters) per chunk.
 * @param overlap - The number of "tokens" to overlap between chunks.
 * @param metadata - The metadata associated with this block.
 * @returns An array of chunk strings.
 */
export function chunkText(
  text: string,
  maxTokens: number = 512,
  overlap: number = 64,
  metadata: RawTextBlock['metadata']
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxTokens, text.length);
    const chunkText = text.slice(start, end).trim();

    if (chunkText.length > 0) {
      chunks.push(chunkText);
    }

    // Slide window with overlap
    // If we've reached the end, we don't need to slide further
    if (end === text.length) break;

    start = Math.max(0, end - overlap);

    // Prevent infinite loop if overlap >= maxTokens
    if (start >= end) {
      start = end + 1;
    }
  }

  return chunks;
}

/**
 * High-level function to process a raw block into chunks.
 */
export function processRawBlock(
  block: RawTextBlock,
  maxTokens: number = 512,
  overlap: number = 64
): string[] {
  return chunkText(block.text, maxTokens, overlap, block.metadata);
}
