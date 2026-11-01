# Reference Knowledge Base: Entities and Relationships

This document serves as a reference for the structural and semantic knowledge that the Document AI Hub system is designed to manage, process, and reason over. It defines the key entities and the types of relationships (Graphify logic) that the Knowledge Representation Layer aims to discover and model.

## 1. Core Entities (Nodes in the Knowledge Graph)
An entity is a distinct, identifiable piece of information extracted or inferred from a source document.

### A. Document
The primary source artifact.
*   **Attributes:**
    *   `documentId`: Unique ID (e.g., UUID).
    *   `fileName`: The original filename (e.g., `contract_2026.md`).
    *   `contentType`: e.g., 'markdown', 'pdf', 'docx' (Future expansion).
    *   `lastModified`: Timestamp of the source file.
    *   `contentHash`: Hash to detect content changes.
*   **Relationship Anchor:** A `Document` can be connected to many `Chunk` entities.

### B. Chunk
A semantically coherent slice of text from a `Document`.
*   **Attributes:**
    *   `chunkId`: Unique ID.
    *   `textSnippet`: The actual text content (abstracted).
    *   `startIndex`: The line/character start in the source document.
    *   `embeddingVector`: The high-dimensional vector representation.
    *   `metadata`: A map containing context (e.g., chapter title, section headers).
*   **Relationship Anchor:** A `Chunk` can be a subject/object in many `Relationship` entities.

### C. AbstractEntity
A named entity (e.g., Person, Company, Product, Date).
*   **Attributes:**
    *   `entityId`: Unique ID.
    *   `entityType`: e.g., 'PERSON', 'ORGANIZATION', 'DATE'.
    *   `value`: The normalized string representation (e.g., "Alice Smith").
*   **Relationship Anchor:** An `AbstractEntity` is often described or mentioned within a `Chunk`.

## 2. Relationship Types (Edges in the Knowledge Graph)
A relationship connects two entities (`A` and `B`) and describes how they are connected.

### A. `MENTIONS` (Entity $\rightarrow$ Chunk)
*   **Definition:** An `AbstractEntity` is mentioned or referenced within a specific `Chunk`.
*   **Example:** `(Alice Smith) MENTIONS (contract_2026.md)`

### B. `IS_A` (Entity $\rightarrow$ Entity)
*   **Definition:** Defines a classification or type relationship between two `AbstractEntity` instances.
*   **Example:** `(Company X) IS_A (FinancialInstitution)`

### C. `PERFORMS` (Entity $\rightarrow$ Entity)
*   **Definition:** An `AbstractEntity` (person) performs an action on another `AbstractEntity` (target).
*   **Example:** `(CEO John Doe) PERFORMS (signing) on (Company X)`

### D. `IS_LOCATED_AT` (Entity $\rightarrow$ Entity)
*   **Definition:** A person or organization is associated with a geographical location entity.
*   **Example:** `(Bob) IS_LOCATED_AT (Tokyo)`

## 3. Data Structuring Process Flow
The process aims to transform raw text chunks into an interconnected graph:
1.  **Ingest & Chunk:** Raw text is segmented into `Chunk` objects.
2.  **Extraction:** A Natural Language Processing (NLP) module (running *after* RAG context retrieval, but *before* final storage) runs over the text of the `Chunk` to identify candidate `AbstractEntity` mentions.
3.  **Relationship Inference:** The system analyzes the surrounding text of the `Chunk` to determine the semantic relationships (`MENTIONS`, `PERFORMS`, etc.) between the identified entities.
4.  **Graph Persistence:** The finalized (Chunk, Entity, Relationship) triplets are stored in the graph database, allowing complex graph traversal queries (e.g., "Find all people who work for Company X and live in Berlin").

This file serves as the semantic target for the advanced "Skill" agents in the MCP layer.
