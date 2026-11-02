import fs from 'fs/promises';
import path from 'path';
import { parseMarkdown } from './src/ingestion/parser';
import { processRawBlock } from './src/ingestion/chunker';
import { OllamaEmbedder } from './src/representation/embedder';
import { PgVectorStore } from './src/representation/vectorstore';
import { v4 as uuidv4 } from 'uuid';

async function runFullPipelineTest() {
  console.log('--- Starting Full Pipeline Test (DB + Ollama) ---');

  const connectionString = 'postgresql://user:password@localhost:5432/doc_ai_hub';
  const vectorStore = new PgVectorStore(connectionString);
  const embedder = new OllamaEmbedder();

  const testFilePath = path.join(process.cwd(), 'test_full.md');
  const testContent = `
# Architecture Overview

This is the official architecture for the Document AI Hub.

## Core Components
- **Ingestion:** Parses Markdown.
- **Representation:** Embeds text using Ollama.
- **Retrieval:** Stores in PGVector.

## Security
Data remains local.
`;

  try {
    console.log('Step 1: Creating test file...');
    await fs.writeFile(testFilePath, testContent);

    console.log('Step 2: Parsing Markdown...');
    const blocks = await parseMarkdown(testFilePath);
    console.log(`Parsed ${blocks.length} blocks.`);

    for (const block of blocks) {
      console.log(`\nProcessing Block: "${block.metadata.title}"`);
      const chunks = processRawBlock(block, 512, 64);
      console.log(`Chunked into ${chunks.length} pieces.`);

      for (const chunkText of chunks) {
        console.log(`  Processing chunk: "${chunkText.substring(0, 40)}..."`);

        console.log(`  Generating embedding via Ollama...`);
        const embedding = await embedder.embed(chunkText);
        console.log(`  Embedding successful (size: ${embedding.length})`);

        console.log(`  Saving to Database...`);
        await vectorStore.add(
          uuidv4(),
          chunkText,
          embedding,
          {
            source: block.metadata.source,
            title: block.metadata.title
          }
        );
        console.log(`  Successfully saved to database.`);
      }
    }

    console.log('\nStep 3: Verification...');
    console.log('Querying "What is the security policy?"');
    const queryVector = await embedder.embed("What is the security policy?");
    const results = await vectorStore.query(queryVector, 2);

    if (results.length === 0) {
      console.warn('Warning: No results found for query.');
    } else {
      console.log(`Found ${results.length} results:`);
      results.forEach((res, i) => {
        console.log(`  ${i + 1}. [Source: ${res.metadata.source}] ${res.content.substring(0, 50)}...`);
      });
    }

    console.log('\nSUCCESS: Phase 1 pipeline completed successfully.');

  } catch (error) {
    console.error('\nFAILED: Pipeline Error');
    console.error('--------------------------------------------------');
    console.error(error);
    console.error('--------------------------------------------------');
    process.exit(1);
  } finally {
    if ((await fs.access(testFilePath).then(() => true).catch(() => false))) {
      await fs.unlink(testFilePath);
      console.log('Cleaned up test file.');
    }
    await vectorStore.close();
  }
}

runFullPipelineTest();
