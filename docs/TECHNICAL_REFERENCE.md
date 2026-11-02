# Technical Reference: Document AI Hub

This document serves as a living guide to the codebase. It provides a high-level overview of each module, its core functions, and representative pseudo-code.

## Directory: `src/types/`

### `chunk.ts`
Defines the core data models for the system.

| Type | Description |
| :--- | :--- |
| `FileMetadata` | Metadata for source files (name, size, etc.) |
| `SourceFile` | The parsed result of a file, containing chunks |
| `RawTextBlock` | A raw segment of a file (e.g. a section under a header) |
| `Chunk` | The final processed unit of text for the database |

---

## Directory: `src/ingestion/`

### `parser.ts`
Handles the extraction of structured text from Markdown source files.

#### `parseMarkdown(filePath: string): Promise<RawTextBlock[]>`
Splits a file into sections based on Markdown headers.
```typescript
// Pseudo-code
const content = await fs.readFile(path);
const sections = content.split(/(?<=\n)#{1,6}\s+/);
return sections.map(section => ({
  text: section.trim(),
  metadata: { ... }
}));
```

### `chunker.ts`
Breaks down large text blocks into smaller chunks with overlapping windows.

#### `chunkText(text: string, maxTokens, overlap): string[]`
Iterates through text to create segments of a specific size.
```typescript
// Pseudo-code
while (start < text.length) {
  const end = Math.min(start + maxTokens, text.length);
  chunks.push(text.slice(start, end));
  start = Math.max(0, end - overlap);
}
```

---

## Directory: `src/representation/`

### `embedder.ts`
Handles the conversion of text into vector embeddings via Ollama.

#### `OllamaEmbedder` (Class)
Wraps the Ollama API for generating embeddings.
- **`embed(text: string): Promise<number[]>`**
  Sends a POST request to the local Ollama instance to generate a vector.
```typescript
// Pseudo-code
const response = await fetch(ollamaEndpoint, {
  method: 'POST',
  body: JSON.stringify({ model, input: text })
});
return response.json().embeddings[0];
```

### `vectorstore.ts`
Handles persistence and similarity search using PostgreSQL and `pgvector`.

#### `PgVectorStore` (Class)
Manages the connection to the database and vector operations.
- **`initialize()`**: Creates the table and HNSW index.
- **`add(id, content, embedding, metadata)`**: Persists a chunk.
```typescript
// Pseudo-code
query(`INSERT INTO documents (id, content, embedding, metadata) 
       VALUES ($1, $2, $3, $4) ON CONFLICT...`)
```
- **`query(queryVector, topK)`**: Performs a cosine similarity search.
```typescript
// Pseudo-code
query(`SELECT * FROM documents ORDER BY embedding <=> $1 LIMIT $2`)
```

---

## Directory: `src/retrieval/`
*(To be populated in Phase 2)*

## Directory: `src/mcp/`
*(To be populated in Phase 3)*
