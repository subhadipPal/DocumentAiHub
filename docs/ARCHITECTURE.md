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
                                          │ 5. Call LLM       │
         ▲                                 └────────┬─────────┘
         │         Grounded Answer with          │
         │         source citations                ▼
         └──────────────────────┬─────────┌──────────────────┐
                                │         │ LLM (API)        │
                                └────────▶│                  │
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

## 9. Roadmap Summary
*   **Phase 1 (Current Focus):** Core ingestion (MD), chunking, and basic RAG chat loop functionality.
*   **Phase 2 (Next):** Integrating production-grade components (Vector DB, API endpoints, advanced skills).
*   **Phase 3:** Google Drive / NextCloud ingestion pipelines.

---

*This architecture provides a blueprint for the Document AI Hub's functionality.*
