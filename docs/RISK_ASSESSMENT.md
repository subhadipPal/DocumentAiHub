# Risk Assessment: Document AI Hub Project

This document outlines potential risks in the development and operation of the Document AI Hub, categorized by area. Mitigation strategies are included to help guide development and maintain the integrity of the project.

## 1. Integration & External Dependency Risks (HIGH)
These risks stem from reliance on external, third-party services (LLMs, Vector DBs, Cloud Storage).

*   **Risk:** **API Unavailability/Cost Overrun.** LLM providers and Vector DBs operate on usage plans. Unexpected high usage, API deprecations, or service outages could halt development or incur unexpected costs.
    *   **Impact:** High (Project stalls; budget risk).
    *   **Mitigation:**
        *   Implement robust error handling (e.g., exponential backoff, retry logic) in the `ingestion/` and `retrieval/` layers.
        *   Design abstract interfaces (`IEmbeddingService`) so that a dependency can be swapped out (e.g., from OpenAI to a local model) with minimal changes.
        *   Use **mocks** for initial development.
*   **Risk:** **Authentication/Credential Leaks.** Storing sensitive API keys (LLM, Drive) within the code or configuration.
    *   **Impact:** Critical (Security breach).
    *   **Mitigation:** Strictly enforce the use of environment variables (`.env` files) and never commit secrets to the repository. Use a `.gitignore` file to exclude the local environment file.

## 2. Design & Complexity Risks (MEDIUM)
These risks relate to the inherent complexity of combining RAG, MCP, and Graph concepts.

*   **Risk:** **Feature Creep/Scope Drift.** The intersection of RAG, MCP, and Graphify is highly complex, leading to continuous, non-critical feature additions that delay the core goal (answering a query).
    *   **Impact:** Medium (Schedule risk).
    *   **Mitigation:** Refer back to `RISK_ASSESSMENT.md` and the core project requirements periodically. Commit to a strict, minimal viable product (MVP) based on basic MD ingestion before tackling advanced "Skill Agents."
*   **Risk:** **Search/Retrieval Inefficiency.** If chunking, embedding, or vector similarity search is inefficient, the RAG pipeline fails to retrieve the correct context, leading to poor answers.
    *   **Impact:** High (Functional failure).
    *   **Mitigation:** Prioritize building and testing the **chunking and retrieval logic** early. Focus on making the retrieved context highly *relevant* rather than just *large*.

## 3. Data Quality Risks (MEDIUM)
These risks concern the input data quality.

*   **Risk:** **Semantic Gaps.** The system might not be able to answer questions requiring inference or knowledge outside the explicitly-stated facts in the documents.
    *   **Impact:** Medium (Limitation of service).
    *   **Mitigation:** This is a limitation of the source material. The MCP layer's `analyze` and `extract` skills are designed to push the system beyond simple retrieval to attempt inference, but this must be managed with user expectations.
*   **Risk:** **Inconsistent Data Format.** Different source formats (e.g., poorly structured PDFs vs. clean MD) will yield inconsistent chunk quality.
    *   **Impact:** Medium (Requires complex pre-processing logic).
    *   **Mitigation:** The `ingestion/` layer must be designed to handle format variations gracefully, potentially using a standardized internal data model.

## 4. Resource and Deployment Risks (CRITICAL)
These risks are specific to the current constraint: running complex AI services (like models) on local hardware (e.g., Mac Mini with 24GB RAM).

*   **Risk:** **Resource Overload/Memory Constraints.** Running large language models or complex vector index searches can quickly exceed available RAM, leading to swapping, severe performance degradation, or process termination.
    *   **Impact:** Critical (Development halt).
    *   **Mitigation:**
        *   Prioritize models like `qwen3-embedding:0.6b` (which are optimized for size).
        *   Limit in-memory data structures (e.g., do not load the entire vector index into RAM; use disk-backed storage).
        *   Implement memory profiling (`process.memoryUsage()`) within the service to preemptively detect overload.
*   **Risk:** **Deployment Complexity (Local vs. Container).** Initial local testing (like using Ollama) is fragile and not reproducible. Scaling requires containerization (Docker).
    *   **Impact:** Medium (CI/CD pipeline failure).
    *   **Mitigation:** Treat Dockerization as a high-priority task in Phase 2. Use Docker Compose to manage the local stack (App + DB + Embedder) to ensure consistent local environment setup.

## Summary Table

| Risk Area | Specific Risk | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| External | API Outages/Cost | High | Mocking, Abstraction, Error Handling |
| Resource | **Resource Overload/Memory Constraints** | **CRITICAL** | **Use smaller, quantized models; disk-backed storage** |
| Design | Scope Creep | Medium | Strict MVP adherence, Regular review |
| Data | Search Inefficiency | High | Early testing of chunking strategies |

***
*This assessment will be reviewed before entering Phase 2.*
