# Feature Specification: Document AI Hub

## 1. Overview
This document specifies the functional requirements and high-level design for the Document AI Hub, a knowledge base system built with TypeScript. This system is designed to consume unstructured documents and make them queryable via a RAG/MCP framework.

## 2. Functional Requirements (FRs)
### FR 2.1 - Document Ingestion
*   **FR 2.1.1 (MD Ingestion):** The system must be able to read, parse, and process Markdown (`.md`) files from a specified directory.
*   **FR 2.1.2 (Text Extraction):** The parser must extract raw text while preserving structural information (e.g., headers, sections) for context.
*   **FR 2.1.3 (Chunking):** The system must implement a semantic chunking algorithm (e.g., based on paragraph breaks or fixed size with overlap) to break down large documents into manageable units.
*   **FR 2.1.4 (Metadata Tagging):** Each generated chunk must be tagged with metadata (e.g., `source_file_name`, `page_number`, `chunk_index`).
*   **Future Requirement (FR 2.1.5):** The system must provide hooks to integrate with Google Drive and NextCloud APIs for dynamic document ingestion.

### FR 2.2 - Knowledge Representation
*   **FR 2.2.1 (Embedding Generation):** The system must utilize an external embedding model (via API call) to convert text chunks into high-dimensional vector representations.
*   **FR 2.2.2 (Storage):** The chunks and their corresponding vectors must be stored in a dedicated Vector Database (e.g., Pinecone, Qdrant).
*   **FR 2.2.3 (Graph Construction):** The system must optionally build relationships between chunks based on semantic similarity or explicit links to enhance complex reasoning (Graphify logic).

### FR 2.3 - Retrieval & Reasoning (RAG)
*   **FR 2.3.1 (Query Vectorization):** The user's query must be transformed into a vector representation using the same embedding model.
*   **FR 2.3.2 (Similarity Search):** The system must perform a similarity search against the stored vectors to retrieve the top-K relevant chunks.
*   **FR 2.3.3 (Contextual Prompting):** The retrieved chunks must be injected into a prompt template along with the original query.
*   **FR 2.3.4 (LLM Invocation):** The final, augmented prompt must be sent to the configured LLM endpoint to generate a grounded response.
*   **FR 2.3.5 (Response Generation):** The system must return a clear, conversational answer, citing the source chunks used for grounding.

### FR 2.4 - Model Context Protocol (MCP)
*   **FR 2.4.1 (Interface Definition):** All interactions (e.g., `query`, `analyze`, `export`) must be handled through a defined interface dispatcher.
*   **FR 2.4.2 (Skill Dispatch):** The system must support a 'Skill' layer where specific agents (`skill-amp`, `skill-claw`, etc.) can be triggered based on user intent.
*   **FR 2.4.3 (History Management):** The system must maintain a conversation history state to allow for multi-turn dialogue.

## 3. Non-Functional Requirements (NFRs)
*   **NFR 3.1 (Technology):** The entire application must be implemented in TypeScript/Node.js.
*   **NFR 3.2 (Scalability):** The design must be modular to support future scaling of data sources (Drive, NextCloud).
*   **NFR 3.3 (Maintainability):** Code must adhere to modern TypeScript practices (strict typing, modular design).

## 4. Success Criteria
*   A user is able to ask a question about a local Markdown file.
*   The system successfully retrieves and uses the relevant chunk to answer the query.
*   The answer is conversational and includes source reference information.

***
*This specification drives the implementation in the `src/` directory.*
