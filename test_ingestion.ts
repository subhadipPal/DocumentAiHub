import fs from 'fs/promises';
import path from 'path';
import { parseMarkdown } from './src/ingestion/parser';
import { processRawBlock } from './src/ingestion/chunker';
import { OllamaEmbedder } from './src/representation/embedder';
import { PgVectorStore } from './src/representation/vectorstore';

async function runTest() {
  console.log('--- Starting Phase 1 Ingestion Test ---');

  // 1. Setup Mock Data
  const testFilePath = path.join(process.cwd(), 'test_doc.md');
  const testContent = `# Introduction
This is the introduction to the Document AI Hub.

## Core Features
- **RAG:** Retrieval Augmented Generation.
- **MCP:** Model Context Protocol.
- **Local:** Runs entirely on your hardware.

## Security
Security is a priority. We use local models to ensure data privacy.
`;

  await fs.writeFile(testFilePath, testContent);
  console.log('Created test file:', testFilePath);

  try {
    // 2. Parse
    const blocks = await parseMarkdown(testFilePath);
    console.log(`Parsed into ${blocks.length} blocks:`, blocks.map(b => b.metadata.title));

    // 3. Chunk
    for (const block of blocks) {
      const chunks = processRawBlock(block, 512, 64);
      console.log(`Block "${block.metadata.title}" split into ${chunks.length} chunks.`);

      for (const chunk of chunks) {
        console.log(`  - Chunk: ${chunk.substring(0, 50)}...`);
      }
    }

    // 4. Embed (Simulated for now since we don't have Ollama running)
    console.log('\n--- Skipping Embedding (requires Ollama) ---');

    // 5. VectorStore (Simulated for now since we don't have Postgres)
    console.log('\n--- Skipping VectorStore (requires PostgreSQL) ---');

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    // Cleanup
    if (await fs.access(testFilePath).then(() => true).catch(() => false)) {
      await fs.unlink(testFilePath);
      console.log('Cleaned up test file.');
    }
  }
}

runTest();
