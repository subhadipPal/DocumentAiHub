# Implementation Plan: Document AI Hub (Local/Edge-Optimized RAG)

## 1. Project Philosophy & Constraints
**GOAL:** To build a fully functional RAG system capable of interactive chat and search, running *entirely* on local hardware (Mac Mini, 24GB RAM) without external internet access for core operations.
**TECHNOLOGY STACK:** TypeScript, Node.js, Ollama (for LLM/Embeddings), SQLite/PostgreSQL (for knowledge storage), Custom Parsers.
**FOCUS:** Efficiency, minimal resource usage, and local reliability over high throughput or enterprise scalability.

## 2. Technology Substitution Plan

The core components from the previous plan must be adapted:

| Previous Component | Cloud/External Solution | Local/Self-Hosted Replacement | Implementation Focus |
| :--- | :--- | :--- | :--- |
| **LLM** | OpenAI, Claude, Gemini | **Ollama + GGUF Models** (e.g., `gemma4:12b`, `llama3:8b`) | Use `ollama` CLI/API wrapper in Node.js for inference. |
| **Embedding** | OpenAI/Cohere | **Ollama Embeddings** (e.g., `qwen3-embedding:0.6b`) | Use `ollama` to generate embeddings locally. |
| **Vector DB** | Pinecone, Qdrant, Weaviate | **SQL (PostgreSQL/SQLite) + pgvector/Vector Extensions** | Use a local PostgreSQL instance and rely on `pgvector` for vector storage/querying. |
| **External Storage** | Google Drive, NextCloud | **Local Filesystem I/O** | The "Ingestion" layer will only handle local directory input. |

## 3. Detailed Implementation Roadmap (Phases 1-4)

This roadmap is sequential and prioritizes working end-to-end loops before expanding complexity.

### 🛠️ PHASE 1: Core Local Ingestion Loop (MD $\rightarrow$ Chunk $\rightarrow$ DB)
**Goal:** Read a single `.md` file, break it into chunks, generate embeddings locally, and store the data in the local database.

1.  **Setup:** Configure the local PostgreSQL instance (`pgvector`).
2.  **Parser (`ingestion/parser.ts`):** Implement a TypeScript function that reads a file stream, splits it by structural elements (e.g., `\n# ` for headers, double newlines for paragraphs), and yields `RawText` blocks with metadata.
3.  **Chunker (`ingestion/chunker.ts`):** Implement a fixed-size chunking algorithm with a defined overlap (e.g., 512 tokens, 128 token overlap).
4.  **Embedding Generation (`representation/embedder.ts`):** Implement a function that calls the local Ollama endpoint (`ollama run qwen3-embedding:0.6b`) to convert text chunks into vectors. This is a key I/O operation.
5.  **Database Write (`representation/vectorstore.ts`):** Implement the `add()` method using the `pgvector` pattern to insert `(id, text, embedding, metadata)` into the local PostgreSQL database.

### 🧠 PHASE 2: Local Retrieval and RAG Loop (Query $\rightarrow$ Context $\rightarrow$ Answer)
**Goal:** Build the core query answering mechanism using only local data.

1.  **Query Vectorization:** Embed the user's query using the same local Ollama endpoint.
2.  **Retrieval (`retrieval/rag.ts`):** Implement the `search()` method that queries the PostgreSQL database using the vector distance operator (`<=>`) to fetch the Top-K chunks.
3.  **Prompt Construction:** Assemble the final prompt in TypeScript, combining the system instructions, the retrieved chunks, and the original query.
4.  **Generation (`retrieval/rag.ts`):** Send the constructed prompt to the local Ollama LLM (`gemma4:12b`) for generating the final grounded response.

### 🛠️ PHASE 3: Model Context Protocol (MCP) Layer
**Goal:** Introduce structured interaction beyond simple Q&A.

1.  **Tool Registration:** Formalize the MCP interface (`mcp/tools.ts`), defining `query`, `search`, `analyze`, etc.
2.  **Skill Implementation:** Implement a basic `skill-extract.ts` that, given a chunk, runs a secondary prompt against the LLM asking it to identify entities and relationships (a process similar to the manual work done in `REFERENCE_KNOWLEDGE_BASE.md`).
3.  **Orchestration:** Build the `mcp/orchestrator.ts` to decide whether to use `query` or trigger a `skill-extract`.

### 🚀 PHASE 4: Packaging and Deployment (Containerization)
**Goal:** Ensure reproducibility across different machines.

1.  **Dockerfile:** Create a Dockerfile that installs dependencies, sets up the application, and includes a startup script.
2.  **Docker Compose:** Create a `docker-compose.yml` file to manage the three necessary services: 1) PostgreSQL/pgvector, 2) The Node.js application, 3) Ollama (if run as a container).

## 4. Success Metrics (Local Focus)
*   **Functional:** A user can successfully ask a question about an uploaded `.md` file and get a contextually grounded answer from a local model.
*   **Resource:** The entire stack (app + DB + embedding service) runs stably on 24GB RAM with minimal CPU utilization.

***
*This plan prioritizes local execution and efficiency over cloud-level enterprise features.*
