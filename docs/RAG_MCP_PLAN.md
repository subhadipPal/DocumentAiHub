# RAG & MCP Document Grounding Project Plan

## 1. Project Goal
To build an interactive knowledge base system capable of querying, searching, and performing complex reasoning over a corpus of technical and general documents, utilizing a Retrieval-Augmented Generation (RAG) pattern combined with a Model Context Protocol (MCP) layer. The initial implementation focuses on handling Markdown (`.md`) files, with a future expansion planned for Google Drive and NextCloud integration.

## 2. Core Components
This system is designed in a modular, TypeScript-first manner.

### A. Document Ingestion Layer (Extractor)
This layer is responsible for acquiring, parsing, and structuring the source documents.
*   **Input Sources (Initial Scope):** Markdown files (`.md`).
*   **Future Scope:** Google Drive API integration, NextCloud API interaction.
*   **Processing:** Documents are sliced (`file_slice.py` equivalent logic in TS), metadata is extracted, and chunks are generated.

### B. Knowledge Representation Layer (Graphify/Embeddings)
This layer transforms the text chunks into a searchable knowledge representation, possibly leveraging a graph structure (Graphify).
*   **Tokenization & Chunking:** Breaking down source text into semantically meaningful chunks.
*   **Embedding Generation:** Converting chunks into vector embeddings.
*   **Knowledge Base Storage:** Storing chunks and embeddings in a structured database (e.g., Vector DB, graph DB).

### C. Retrieval and Reasoning Layer (RAG)
This is the core logic that answers user queries.
*   **Query Pre-processing:** Handling the user's natural language question.
*   **Retrieval:** Finding the most relevant document chunks based on the query's vector representation (vector search).
*   **Prompt Construction:** Contextualizing the query by inserting retrieved chunks into a prompt template.
*   **Response Generation:** Sending the augmented prompt to an LLM (Large Language Model) for generating a grounded answer.

### D. Model Context Protocol (MCP) Layer
This acts as the service orchestrator, enabling structured interactions and advanced tasks (beyond simple Q&A).
*   **Interface Dispatch:** Managing different types of calls (e.g., `query`, `analyze`, `extract`).
*   **Skill Agents:** Implementing specialized tasks (e.g., `skill-amp`, `skill-claw`).
*   **State Management:** Tracking conversation history and task state.

## 3. Technology Stack
*   **Primary Language:** TypeScript (TS)
*   **Runtime:** Node.js
*   **Key Libraries:** Graph database client (or suitable graph representation in memory), Vector DB client, LLM SDK.

## 4. Initial Milestones (Phase 1)
1.  [ ] Implement a basic Markdown parser/ingestor (Target: Read `docs/*.md`).
2.  [ ] Implement a basic chunking mechanism in TypeScript.
3.  [ ] Implement a dummy embedding/similarity search function (focusing on retrieval logic).
4.  [ ] Build the core chat loop that takes a query, retrieves chunks, and prints a simulated RAG response.

## 5. Future Enhancements (Phase 2+)
*   [ ] Integrate a real Vector Database (e.g., Pinecone, Weaviate).
*   [ ] Implement advanced agents (`skill-agents.md` equivalent logic).
*   [ ] Implement API endpoints for external consumption.
*   [ ] Integrate Google Drive/NextCloud data pipelines.

***
*This document outlines the architectural approach. Actual implementation will follow.*
