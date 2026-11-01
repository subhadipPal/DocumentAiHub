---
name: architecture
description: System architecture, data flow diagrams, and TypeScript module map for Document AI Hub
metadata:
  type: project
---

# Architecture Overview: Document AI Hub (RAG/MCP)

## 1. Project Foundation
*   **Name:** Document AI Hub
*   **Target Stack:** TypeScript / Node.js
*   **Goal:** To provide an interactive system for querying and performing advanced tasks over documents using a Retrieval-Augmented Generation (RAG) paradigm controlled by a Model Context Protocol (MCP) layer.
*   **Modularity:** The system is designed with clear separation of concerns: Ingestion, Representation, Retrieval, and Protocol Orchestration.

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP LAYER (Orchestrator)                  │
│                                                             │
│  ┌──────────┐    ┌────────────┐    ┌─────────────────┐     │
│  │Intent    │    │Skill Agent │    │Session History  │     │
│  │ Dispatcher│───▶│ (skill-amp)│    │ Manager         │     │
│  └──────────┘    └────────────┘    └─────────────────┘     │
│        ▲                                              │     │
│        │  dispatches                                  │     │
└────────┼───────────────────────────────────────────────┘    │
         ▼                                                    │
┌─────────────────────────────────────────────────────────────┐
│                 RAG / REASONING LAYER                       │
│                                                             │
│  User Query ──▶ Embedding Service ──▶ Vector Search ──▶ Top-K │
│                (OpenAI/Cohere)           (Pinecone/Qdrant)  │
│                                                             │
│  Top-K Chunks ──▶ Prompt Builder ──▶ LLM (Anthropic/OpenAI) │
│                                   ──▶ Grounded Answer        │
└───────────────────────────▲───────────────────────────────┘
                            │ retrieves
┌───────────────────────────▼───────────────────────────────┐
│            KNOWLEDGE REPRESENTATION LAYER                  │
│                                                             │
│  Text Chunks ──▶ Embedding API ──▶ Vector DB (store vectors) │
│  Metadata       ─────────────────► Chunk Index (metadata)    │
│                                                             │
│  Optional: Graph Construction (chunk-to-chunk relationships)│
└───────────────────────────▲───────────────────────────────┘
                            │ ingests
┌───────────────────────────▼───────────────────────────────┐
│                    DOCUMENT INGESTION LAYER                 │
│                                                             │
│  ┌─────────┐   ┌───────┐   ┌──────────┐  ┌───────────────┐  │
│  │ File    │   │Parser │   │Chunker   │──▶│Metadata Tagger│  │
│  │ Source  │──▶(Markdown)──▶(semantic)─────────────────────┘  │
│  │         │   └─────────┘                                   │
│  │ .md     │                                                 │
│  └─────────┘                                                 │
│                                                             │
│  Future: Google Drive API ─── NextCloud API                 │
└─────────────────────────────────────────────────────────────┘

```

## 3. Data Flow: Query → Answer (Step-by-Step)

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  USER       │────▶│  MCP Dispatcher   │────▶│ RAG Query Handler  │
│              │     │                  │     │                  │
│  "What is   │     │  → intent: query │     │ 1. Embed query    │
│   the config│     └──────────────────┘     │ 2. Search vectors │
│   settings?"│                           ──▶│ 3. Retrieve top-K │
└─────────────┘                           ──▶│ 4. Build prompt   │
         ▲                                   │ 5. Call LLM       │
         │         Grounded Answer with      └───────────────────┘
                                                   ▼
         │         source citations                └─────────┐
         └──────────────────────┬─────────┌──────────────────┘
                                │         │
                                └────────▶│ LLM (API)        │
                                         └──────────────────┘

```

## 4. Query Flow: Advanced Task (Skill Dispatch)

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  USER       │────▶│  MCP Dispatcher   │────▶│ Skill Router     │
│              │     │                  │     │                  │
│  "Extract   │     │  → intent:       │────▶│ 1. Analyze query  │
│   all the   │     │    "analyze"      │     │ 2. Match to skill │
│   API keys  │     └──────────────────┘     │ 3. Execute        │
│   from docs"│                           ──▶│    skill-amp     │
└─────────────┘                           ──▶│ 4. Return result  │
                                           └──────────────────┘

         Skill: extract_keys → RAG Layer → Vector Search → LLM Synthesis
```

## 5. Core Components Detail

### A. Document Ingestion Layer (Extractor)
*   **Responsibility:** Acquires, parses, and structures raw data.
*   **Current Implementation:** Focuses on Markdown (`.md`) file ingestion. This involves reading the file system, applying regex/structural parsing, and extracting raw text blocks.
*   **Pipeline Stages:**
    1.  **Parsing:** Markdown → Raw Text + Metadata.
    2.  **Slicing:** Raw Text → Semantic Chunks.
    3.  **Metadata Tagging:** Attaching source file and index information to each chunk.
*   **Future Expansion:** API integration modules will be built to handle external sources like Google Drive and NextCloud.

### B. Knowledge Representation Layer (Graphify/Embeddings)
*   **Responsibility:** Transforming textual chunks into a machine-readable knowledge graph and vector index.
*   **Vectorization:** Chunks are passed to an external service/API (e.g., OpenAI, Cohere) to generate a high-dimensional embedding vector.
*   **Storage:** These vectors and the original chunks are persisted in a Vector Database.
*   **Graph Construction:** Advanced modules analyze semantic relationships between chunks (e.g., identifying parent-child relationships or dependencies) to build a local or distributed knowledge graph.

### C. Retrieval and Reasoning Layer (RAG)
*   **Responsibility:** Answering user queries by synthesizing knowledge from the corpus.
*   **Flow:**
    1.  User Query → Vectorization (Query Embedding).
    2.  Similarity Search → Retrieval of Top-K context chunks.
    3.  Context Assembly → Insertion of retrieved chunks into a pre-defined LLM prompt template.
    4.  LLM → Grounded Answer Generation.
*   **Output:** The final response must be traceable back to the source chunks.

### D. Model Context Protocol (MCP) Layer
*   **Responsibility:** Acting as the central brain/service orchestrator. It manages the overall workflow and interprets user intent.
*   **Features:**
    *   **Intent Recognition:** Dispatches the request to the correct handler (e.g., `query`, `search`, `analyze`).
    *   **Skill Execution:** Triggers specialized logic modules (Skill Agents) when the query requires actions beyond simple RAG retrieval (e.g., `skill-amp`).
    *   **State Management:** Maintains session context (history).

## 6. MCP Interface Definition

```typescript
// MCP Tool Registry — what the orchestrator exposes to users/agents

interface MCPTools {
  query: {
    description: "Ask a question about the documents";
    parameters: { content: string; topK?: number };
  };
  search: {
    description: "Search for keywords in the document corpus";
    parameters: { term: string; topK?: number };
  };
  analyze: {
    description: "Analyze specific aspects of documents (e.g., extract entities, summarize)";
    parameters: { aspect: string; topK?: number };
  };
  extract: {
    description: "Extract structured data (API keys, contacts, configs) from documents";
    parameters: { targetType: string; topK?: number };
  };
  summarize: {
    description: "Summarize the entire corpus or a specific document";
    parameters: { document?: string };
  };
}

// MCP Server Handler Flow (pseudocode)
async function handleMCPRequest(request: { tool: string; params: Record<string, any> }): Promise<any> {
  const tool = request.tool;

  switch (tool) {
    case 'query':
      return await ragHandler.query(request.params.content, request.params.topK);

    case 'search':
      return await ragHandler.search(request.params.term, request.params.topK);

    case 'analyze':
      return await skillRouter.execute('skill-amp', { ...request.params });

    case 'extract':
      return await skillRouter.execute('skill-extract', { ...request.params });

    case 'summarize':
      return await ragHandler.summarize(request.params.document);

    default:
      throw new Error(`Unknown MCP tool: ${tool}`);
  }
}

```

## 7. Google Drive & NextCloud Integration Strategy (Phase 2)

```
┌──────────────────────┐      ┌───────────────────────┐
│  Google Drive Client │◀────▶│  Auth + OAuth2 Flow     │
│                      │      │  (Drive API credentials)│
└──────────┬───────────┘      └───────────────────────┘
           │
           ▼
┌──────────────────────┐      ┌───────────────────────┐
│  NextCloud Client    │◀────▶│  WebDAV / REST API     │
│                      │      │  (NextCloud credentials)│
└──────────┬───────────┘      └───────────────────────┘
           │
           ▼
┌──────────────────────┐
│  Unified Document     │
│  Adapter Layer        │
│                      │
│  • Normalize file    │
│    content to text   │
│  • Attach source     │
│    metadata          │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Ingestion Pipeline   │
│  (same as MD files)  │
└──────────────────────┘

```

**Integration Points:**
| Feature | Google Drive | NextCloud |
|---|---|---|
| **Auth** | OAuth 2.0 via Google Identity Services | WebDAV header / API token |
| **List Docs** | `drive.files().list()` | `/restapi/automaton/v1/files` |
| **Read Content** | Download blob → parse Markdown | `/restapi/content/...` streaming |
| **Watch Changes** | Polling or Pub/Sub webhook | WebDAV `DAv:copy` + polling |
| **Chunking** | Same as MD parser (no format change) | Same as MD parser (no format change) |

## 8. Technology Decisions
*   **Primary Language:** TypeScript (TS)
*   **Runtime:** Node.js
*   **Embedding Models:** OpenAI `text-embedding-3-small`, Cohere `embed-v3`
*   **Vector Database:** Pinecone, Qdrant (choice deferrable)
*   **LLM Endpoints:** Anthropic Claude, OpenAI GPT-4 (configurable)
*   **Testing:** Jest + Vitest, `vitest-mock-dns` for file system testing

## 9. Pseudocode: Core Layer Implementations (TypeScript)

### 9.1 Ingestion Pipeline (Markdown → Chunks)
```typescript
// src/ingestion/parser.ts
async function parseMarkdown(filePath: string): Promise<RawChunk[]> {
  const text = await fs.readFile(filePath, 'utf-8');

  // Split by headers (H1–H2), preserve structural context
  const sections = text.split(/(?<=\n)#{1,2}\s/);

  return sections.map((section, i) => ({
    text: section.trim(),
    metadata: { source: filePath, sectionIndex: i },
  }));
}

// src/ingestion/chunker.ts — semantic chunking with overlap
function semanticChunk(text: string, maxTokens: number = 512, overlap: number = 64): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxTokens, text.length);
    const chunkText = text.slice(start, end).trim();

    if (chunkText.length > 0) {
      chunks.push({ text: chunkText, offset: start, length: end - start });
    }

    // Slide window with overlap
    start += maxTokens - overlap;
  }

  return chunks;
}

// Combined pipeline
async function ingestDocument(filePath: string): Promise<Chunk[]> {
  const sections = await parseMarkdown(filePath);
  return sections.flatMap(section => semanticChunk(section.text));
}

```

### 9.2 Knowledge Representation (Embedding + Storage)
```typescript
// src/representation/embedder.ts
interface EmbeddingService {
  embed(text: string): Promise<number[]>; // returns vector array
}

// src/representation/vectorstore.ts
interface IVectorStore {
  add(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
  query(vector: number[], topK: number): Promise<Document[]>;
}

async function indexChunks(chunks: Chunk[], store: IVectorStore, embedder: EmbeddingService): Promise<void> {
  for (const chunk of chunks) {
    const vector = await embedder.embed(chunk.text);
    await store.add(
      chunk.id,
      vector,
      { source: chunk.metadata.source, sectionIndex: chunk.metadata.sectionIndex }
    );
  }
}

```

### 9.3 Retrieval & Reasoning (RAG)
```typescript
// src/retrieval/rag.ts
class RAGHandler {
  constructor(private store: IVectorStore, private embedder: EmbeddingService) {}

  async query(userQuery: string, topK: number = 5): Promise<GroundedResponse> {
    // Step 1: Embed the query
    const queryVector = await this.embedder.embed(userQuery);

    // Step 2: Retrieve top-K matching chunks
    const matches = await this.store.query(queryVector, topK);

    // Step 3: Build augmented prompt
    const context = matches.map(m => `---\n[MATCH] ${m.metadata.source}\n\n${m.text.substring(0, 500)}\n`).join('\n');
    const prompt = `Answer the following question based on the retrieved context.\n\nContext:\n${context}\n\nQuestion: ${userQuery}\n\nAnswer:`;

    // Step 4: Call LLM (via MCP service)
    const llmResponse = await llmClient.generate(prompt);

    return {
      answer: llmResponse,
      sources: matches.map(m => m.metadata.source),
    };
  }

  async search(term: string, topK: number = 5): Promise<SearchResults> {
    // Keyword-based search fallback for exact matches
    const results = await this.store.searchByTerm(term, topK);
    return { term, matches: results };
  }
}

// src/retrieval/skillRouter.ts — dispatches to specialized agents
class SkillRouter {
  private skills: Record<string, SkillAgent>;

  async execute(skillName: string, params: any): Promise<any> {
    const agent = this.skills[skillName];
    if (!agent) throw new Error(`Skill not found: ${skillName}`);

    return agent.execute(params);
  }

  // Register skills dynamically
  register(name: string, agent: SkillAgent): void {
    this.skills[name] = agent;
  }
}

// Example: skill-amp (amplified analysis)
class SkillAmp implements SkillAgent {
  async execute(params: { query: string; topK?: number }): Promise<any> {
    const rag = new RAGHandler(store, embedder);
    const result = await rag.query(params.query, params.topK);

    // LLM post-processing: structure the answer with deep analysis
    const analysis = await llmClient.generate(`Analyze deeply: ${result.answer}`);

    return { type: 'analysis', result, analysis };
  }
}

```

### 9.4 MCP Layer (Orchestrator)
```typescript
// src/mcp/orchestrator.ts
class MCPOrchestrator {
  private history: ConversationHistory = [];

  async process(userInput: string): Promise<Response> {
    // Step 1: Intent classification (simple pattern matching or LLM-based)
    const intent = classifyIntent(userInput);

    // Step 2: Dispatch to handler
    switch (intent) {
      case 'query':
        return await ragHandler.query(userInput);

      case 'search':
        const term = extractTerm(userInput);
        return await ragHandler.search(term);

      case 'analyze':
        return await skillRouter.execute('skill-amp', { query: userInput });

      default:
        return ragHandler.query(userInput); // fallback to RAG
    }

    // Step 3: Store in history for multi-turn
    this.history.push({ user: userInput, timestamp: Date.now() });
  }

  private classifyIntent(text: string): Intent {
    const lower = text.toLowerCase();
    if (/extract|find all|get all|list all/i.test(lower)) return 'analyze';
    if (/search|find|keyword|contains/i.test(lower)) return 'search';
    return 'query'; // default to RAG question answering
  }
}

```

## 10. Proposed TypeScript Module Map (src/ directory)

```
src/
├── main.ts                    # Entry point: bootstraps the app
│
├── ingestion/                 # Document Ingestion Layer
│   ├── parser.ts              # Markdown → Raw Text + metadata
│   ├── chunker.ts             # Semantic chunking with overlap
│   └── ingestionPipeline.ts   # Orchestrates parse → chunk → tag
│
├── representation/            # Knowledge Representation Layer
│   ├── embedder.ts            # Embedding API client (OpenAI/Cohere)
│   └── vectorstore.ts         # IVectorStore interface + implementations
│
├── retrieval/                 # Retrieval & Reasoning Layer
│   ├── rag.ts                 # RAGHandler: query → embed → search → LLM
│   └── skillRouter.ts         # SkillAgent dispatch and registration
│
├── mcp/                       # Model Context Protocol Layer
│   ├── orchestrator.ts        # Intent classifier + dispatcher
│   └── tools.ts               # MCP tool registry definitions
│
├── skills/                    # Specialized agents
│   ├── skill-amp.ts           # Amplified analysis agent
│   └── skill-extract.ts       # Structured data extraction agent
│
├── config/                    # Configuration & environment
│   ├── env.ts                 # Load .env (API keys, vector DB, etc.)
│   └── constants.ts           # Chunk size, overlap, topK defaults
│
└── types/                     # Shared TypeScript interfaces
    ├── chunk.ts               # Chunk interface { text, metadata, id }
    ├── embedding.ts           # EmbeddingService + IVectorStore interfaces
    └── mcp/                   # MCPTool definitions, ConversationHistory
```

## 11. ASCII: Module Dependency Flow

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  main.ts     │───▶│  mcp/           │    │ ingestion/      │
│              │    │  orchestrator  │    │  parser +       │
└──────────────┘    └───────┬───────┘    │  chunker        │
                            │            └────────┬────────┘
         calls dispatch to     │                    │
                  ▼           │                    ▼
              ┌─────────────┐    ┌───────────────────┐
              │ rag.ts      │◀──▶│ representation/   │
              │             │    │  embedder +       │
              └──────┬──────┘    │  vectorstore      │
                     │           └───────────────────┘
                     │ uses
              ┌──────▼──────┐
              │ skillRouter │
              └──────┬──────┘
                     │ delegates to
              ┌──────▼──────┐
              │  skills/    │
              │ skill-amp   │
              └─────────────┘

```

---

**ARCHITECTURE.md complete.** Ready to move on to **RAG_MCP_PLAN.md** (adding pseudocode and diagrams there)? Or would you prefer to adjust anything in the architecture first?

