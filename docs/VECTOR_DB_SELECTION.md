# Vector Database Selection for Document AI Hub

## Executive Summary

This document evaluates top vector database options for our RAG/MCP document grounding system built with TypeScript/Node.js. The selection prioritizes **cost-effectiveness for initial development**, **TypeScript client support**, and **ease of deployment**.

---

## Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| TypeScript Support | ⭐⭐⭐⭐⭐ | Native TypeScript client or excellent JS/TS types |
| Cost (Free Tier) | ⭐⭐⭐⭐⭐ | Free tier size limits and usage restrictions |
| Ease of Setup | ⭐⭐⭐⭐⭐ | Quick start, self-hosted vs managed complexity |
| Search Performance | ⭐⭐⭐⭐ | Similarity search quality and speed |
| Scalability | ⭐⭐⭐ | Ability to grow as data volume increases |

---

## Top 5 Vector Database Comparison

### 1. **pgvector (PostgreSQL)** ⭐ RECOMMENDED FOR START

**Description**: Open-source vector similarity search extension for PostgreSQL.

| Aspect | Details |
|--------|---------|
| **TypeScript Client** | ✅ Excellent - `@neondatabase/async-pg` or standard `pg` with full TypeScript support |
| **Free Tier** | ✅ Free (Postgres free tier, pgvector is free) |
| **Deployment** | Self-hosted / Cloud PostgreSQL (Neon, Railway, Supabase, AWS RDS) |
| **Max Free Capacity** | PostgreSQL depends on instance size; Neon free: 2GB storage, Supabase free: unlimited rows up to 1GB |
| **Similarity Search** | ✅ Native cosine similarity, L2 distance via `vector <-> 'query'::vector` |
| **Pros** | • Uses familiar relational DB<br>• Full SQL flexibility for hybrid search (text + vector)<br>• Zero vendor lock-in<br>• Mature PostgreSQL ecosystem<br>• Easy scaling |
| **Cons** | • Requires PostgreSQL instance setup<br>• No built-in clustering/sharding<br>• Limited concurrency on free tiers |

**Best For**: Applications needing relational + vector capabilities, hybrid search scenarios.

---

### 2. **ChromaDB** ⭐ RECOMMENDED FOR EASE OF USE

**Description**: Open-source embedding database, simple Python/JS client-first design.

| Aspect | Details |
|--------|---------|
| **TypeScript Client** | ✅ Native `chromadb` package with TypeScript support |
| **Free Tier** | ✅ Free open-source version (local only) |
| **Deployment** | Self-hosted via Docker or local; Cloud: Chroma Cloud (free tier 10k vectors) |
| **Max Free Capacity** | Local: unlimited<br>Chroma Cloud free: ~10,000 vectors |
| **Similarity Search** | ✅ Native k-NN search with cosine/dot-product/L2 metrics |
| **Pros** | • Extremely simple API<br>• Fast local development<br>• Easy Docker deployment<br>• No setup required for local use |
| **Cons** | • Cloud version limited to 10k vectors (free)<br>• Less feature-complete than enterprise options<br>• Not designed for multi-tenant scenarios |

**Best For**: Rapid prototyping, MVP development, projects < 100M vectors long-term.

---

### 3. **Qdrant** ⭐ RECOMMENDED FOR PERFORMANCE

**Description**: Fast vector similarity search engine written in Rust.

| Aspect | Details |
|--------|---------|
| **TypeScript Client** | ✅ `qdrant-client` (TypeScript) with full type support |
| **Free Tier** | ✅ Free open-source self-hosted; Cloud free tier: 100M vectors, 5GB RAM |
| **Deployment** | Self-hosted via Docker / Qdrant Cloud (free + paid tiers) |
| **Max Free Capacity** | Self-hosted: unlimited<br>Cloud free: 100M vectors |
| **Similarity Search** | ✅ Native cosine, dot-product, Manhattan distance + filters/HNSW |
| **Pros** | • Extremely fast (Rust backend)<br>• Flexible query types with filters<br>• Cloud offers generous free tier (100M vectors)<br>• Easy Docker setup |
| **Cons** | • Steeper learning curve than ChromaDB<br>• Self-hosting requires ~2-4GB RAM |

**Best For**: Production systems, large datasets (1M+ vectors), filter-aware queries.

---

### 4. **Weaviate** ⭐ RECOMMENDED FOR HYBRID SEARCH

**Description**: Modular vector DB with built-in module system for hybrid search.

| Aspect | Details |
|--------|---------|
| **TypeScript Client** | ✅ `weaviate-client` with TypeScript support |
| **Free Tier** | ✅ Free tier: 100k vectors, Cloud free (self-hosted unlimited) |
| **Deployment** | Self-hosted / Weaviate Cloud (free & paid tiers) |
| **Max Free Capacity** | Cloud: 100k vectors; Self-hosted: unlimited |
| **Similarity Search** | ✅ Cosine + hybrid search (BM25 + vector) built-in |
| **Pros** | • Native hybrid search support<br>• Flexible schema-less design<br>• GraphQL + REST API options<br>• Good cloud offering with features |
| **Cons** | • Hybrid search can add complexity<br>• Cloud free tier limited to 100k vectors<br>• Self-hosting requires ~2GB RAM |

**Best For**: Projects needing semantic + keyword search, flexible schema design.

---

### 5. **Milvus** ⭐ FOR ENTERPRISE SCALING

**Description**: Apache-backed open-source vector database for massive scale.

| Aspect | Details |
|--------|---------|
| **TypeScript Client** | ✅ `@zilliz/milvus2-sdk-node` (TypeScript) |
| **Free Tier** | ✅ Free open-source; Cloud: 24h trial + pay-as-you-go after |
| **Deployment** | Self-hosted standalone / Zilliz Cloud |
| **Max Free Capacity** | Self-hosted: unlimited<br>Cloud: Pay-after-trial model |
| **Similarity Search** | ✅ Multiple metrics (cosine, L2, IP) + HNSW/IVF indexes |
| **Pros** | • Designed for 1B+ vector scale<br>• Horizontal scalability<br>• Apache incubator project |
| **Cons** | • Complex setup (standalone vs cluster modes)<br>• Higher resource requirements<br>• Overkill for small projects |

**Best For**: Enterprise-scale systems, >100M vectors, horizontal scaling needs.

---

### 6. **Pinecone** ⭐ RECOMMENDED FOR CLOUD MANAGED (BUT PAID)

| Aspect | Details |
|--------|---------|
| **TypeScript Client** | ✅ `@pinecone-database/pinecone` with full TS support |
| **Free Tier** | ⚠️ Limited: 1M vectors, free forever but constrained |
| **Deployment** | Cloud-only (no self-hosted option) |
| **Max Free Capacity** | 1M vectors / day limit |
| **Similarity Search** | ✅ Cosine + dot-product built-in |
| **Pros** | • Fully managed, zero ops<br>• High availability built-in<br>• Easy cloud integration |
| **Cons** | • Vendor lock-in<br>• Paid after free tier ($1-2M vector limit) - ~$30/month<br>• No self-hosted option |

---

## Quick Decision Matrix

```
┌─────────────┬──────────────┬─────────────┬─────────────────┐
│ Use Case    │ Best Fit     │ Budget      │ Complexity      │
├─────────────┼──────────────┼─────────────┼─────────────────┤
│ MVP/Prototype│ ChromaDB     │ Free        │ Low             │
│ Relational+Vector │ pgvector    │ Free        │ Medium          │
│ Production (1M+) │ Qdrant   │ Free (self-host) │ Medium       │
│ Hybrid Search │ Weaviate     │ Free (cloud)  │ Medium-High     │
│ Enterprise Scale │ Milvus      │ Free tier    │ High            │
│ Managed Cloud│ Pinecone     | Paid (~$30/mo)| Low             │
└─────────────┴──────────────┴─────────────┴─────────────────┘
```

---

## Detailed Cost Comparison (Free Tier Focus)

| Database | Free Resources | Hidden Costs | Estimated Monthly Free Cost |
|----------|---------------|--------------|------------------------------|
| **pgvector** | PostgreSQL instance + vector index | Cloud DB hosting ($0-7/mo free tiers) | **$0 - $5** |
| **ChromaDB** | Local only (unlimited) | None (open-source) | **$0** (local) / ~$5 (cloud) |
| **Qdrant** | Self-hosted + Cloud free tier (100M vectors) | Server resources (~2-4GB RAM) | **$0** (self-host) |
| **Weaviate** | Self-hosted or Cloud free tier (100k vectors) | Self-host: server costs | **$0** (self-host) |
| **Milvus** | Standalone free (unlimited) | Server + storage requirements | **$0** (self-host) |
| **Pinecone** | 1M vectors, free forever | Limited to free tier | **$0 - $30+** |

---

## Performance Comparison

| Database | Index Type | Search Speed (1M vectors) | Latency (avg) | Throughput |
|----------|------------|--------------------------|---------------|------------|
| **pgvector** | IVFFlat / HNSW (optional) | ~50-200ms | 100ms | Moderate |
| **ChromaDB** | HNSW | ~50-150ms | 80ms | Fast |
| **Qdrant** | HNSW / DiskANN | ~20-80ms | 30-50ms | Very Fast |
| **Weaviate** | HNSW | ~40-120ms | 60ms | Fast |
| **Milvus** | HNSW / IVF Flat | ~30-100ms | 40-80ms | High |
| **Pinecone** | Optimized indexes | ~20-70ms | 30-50ms | Fast |

---

## TypeScript Implementation Patterns

### Common Pattern (All Databases)

```typescript
// Shared interface for abstraction
interface VectorDatabase {
  // Add embedding with optional metadata
  add(indexName: string, vector: number[], 
       metadata?: Record<string, unknown>): Promise<void>
  
  // Search with k nearest neighbors
  search(
    indexName: string,
    queryVector: number[],
    topK: number = 5,
    filter?: object
  ): Promise<SearchResult[]>
}

interface SearchResult {
  id: string
  distance: number
  score: number // normalized similarity score
  metadata: Record<string, unknown>
  vector: number[]
}
```

---

### pgvector Implementation Pattern

```typescript
import { Pool } from 'pg';

class PgVectorDB {
  private pool: Pool;
  
  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }
  
  async add(indexName: string, text: string, metadata: Record<string, unknown>) {
    // Create collection if doesn't exist
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS ${indexName} ON documents (embedding)
      USING hnnsv4 WITH (m = 16, ef_construction = 128);
    `);
    
    const docId = crypto.randomUUID();
    const embedding = await getEmbedding(text); // OpenAI/Cohere/etc.
    
    return this.pool.query(`
      INSERT INTO documents (id, content, embedding, metadata)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [docId, text, embedding, JSON.stringify(metadata)]);
  }
  
  async search(
    indexName: string,
    queryText: string,
    topK = 5
  ) {
    const embedding = await getEmbedding(queryText);
    
    // PostgreSQL vector similarity (cosine distance)
    return this.pool.query(`
      SELECT id, content, metadata
      FROM documents
      ORDER BY documents.embedding <=> $1
      LIMIT $2;
    `, [embedding, topK]);
  }
}
```

---

### ChromaDB Implementation Pattern

```typescript
import { ChromaClient } from 'chromadb';
import { getEmbeddingFunction } from '@langchain/bedrock';

class ChromaVectorDB {
  private client: ChromaClient;
  
  async init(collectionName: string = 'documents') {
    const ef = await getEmbeddingFunction({ region: 'us-east-1' });
    
    this.client = new ChromaClient({
      path: './chroma_db', // local persistence or 'http://localhost:8000'
      collectionMetadata: {hnsw: {construction_ef: 128, m: 16}}
    });
    
    const collection = await this.client.getOrCreateCollection(
      { name: collectionName },
      { embeddingFunction: ef }
    );
    
    return collection;
  }
  
  async add(text: string, metadata: Record<string, unknown>) {
    if (!this.collection) {
      await this.init();
    }
    
    const embedding = await this.embeddingFunction.embedQuery([text]);
    await this.collection.add(
      { embeddings: embedding[0], vectors: null }, // or omit vectors
      { ids: ['doc_' + crypto.randomUUID()] },
      metadata as Record<string, unknown>
    );
  }
  
  async search(queryText: string, topK = 5) {
    if (!this.collection) {
      await this.init();
    }
    
    const embedding = await this.embeddingFunction.embedQuery([queryText]);
    const results = await this.collection.query(
      {
        queryEmbeddings: [embedding[0]],
        nResults: topK,
        where: {} // filter criteria if needed
      }
    );
    
    return results;
  }
}
```

---

### Qdrant Implementation Pattern

```typescript
import { Client as QdrantClient } from '@qdrant/qdrant';

class QdrantVectorDB {
  private client: QdrantClient;
  
  constructor(baseUrl: string, options?: object) {
    this.client = new QdrantClient({ url: baseUrl, ...options });
  }
  
  async init(collectionName: string = 'documents') {
    const vectorsConfig = { 
      name: 'default', 
      size: 1536, // or whatever embedding dimension you use
      distance: 'COSINE' 
    };
    
    await this.client.createCollection({
      collection_name: collectionName,
      vectors: vectorsConfig,
      hnsw_config: {
        m: 32,
        ef_construct: 128
      }
    });
    
    return this.client.collection(collectionName);
  }
  
  async add(
    text: string, 
    metadata: Record<string, unknown>,
    id?: string
  ) {
    const embedding = await getEmbedding(text);
    
    const docId = id || crypto.randomUUID();
    
    await this.client.upsert({
      collection_name: 'documents',
      points: [
        {
          id: docId,
          vector: embedding,
          payload: metadata as Record<string, unknown>
        }
      ]
    });
  }
  
  async search(queryText: string, topK = 5) {
    const embedding = await getEmbedding(queryText);
    
    const results = await this.client.search({
      collection_name: 'documents',
      queryVectors: [embedding],
      limit: topK,
      with_payload: true,
      with_vectors: false // omit if not needed
    });
    
    return results;
  }
}
```

---

### Weaviate Implementation Pattern

```typescript
import { Client as WeaviateClient } from 'weaviate-ts-client';

class WeaviateVectorDB {
  private client: WeaviateClient;
  
  constructor(baseUrl: string, options?: object) {
    this.client = new WeaviateClient({ 
      scheme: 'https',
      url: baseUrl,
      ...options 
    });
  }
  
  async init(collectionName: string = 'Documents') {
    // Define schema with vectorizer (e.g., OpenAI, Google, or none)
    await this.client.schema.classNameExist({ className: collectionName })
      .then(exists => !exists);
    
    // Create property schema if needed
    await this.client.schema.getClasses({ class_name: collectionName });
  }
  
  async add(text: string, metadata: Record<string, unknown>, id?: string) {
    const docId = id || crypto.randomUUID();
    
    await this.client.data
      .object()
      .withMetadata(metadata as Record<string, unknown>)
      .withVector(null) // vector auto-generated or provided
      .do({
        class: 'Documents',
        id: docId,
        content: text
      });
  }
  
  async search(queryText: string, topK = 5) {
    // Using hybrid search (text + vector)
    const results = await this.client.graphql
      .get({
        class: 'Documents',
        where: {}, // optional filters
        limit: topK,
        variables: {
          queryVector: [await getEmbedding(queryText)]
        }
      });
    
    return results.data.Get.Documents;
  }
}
```

---

## Final Recommendation

### 🏆 **For Our Document AI Hub: Use pgvector (PostgreSQL)**

**Justification:**

1. **Developer Experience**: PostgreSQL is familiar to most backend developers, reducing onboarding time. Full SQL query flexibility means we can build complex hybrid queries without vendor constraints.

2. **Cost**: Free tier options exist for all major cloud providers (Neon free tier: 90-day trial → $5/mo for 0.5GB-2GB RAM). Much more predictable than other options.

3. **Scalability**: Can grow from development to production seamlessly. PostgreSQL + pgvector scales horizontally with sharding if needed.

4. **Hybrid Search Ready**: Native support for full-text search + vector similarity in same query:
   ```sql
   SELECT * FROM documents
   WHERE content ILIKE '%search term%'
     AND embedding <-> 'query' < 0.8;
   ```

5. **Vendor Agnostic**: No lock-in. Can move between AWS RDS, Neon, Supabase, Railway, etc. with minimal changes.

6. **Open Source**: Both PostgreSQL and pgvector are mature open-source projects with active communities.

**When NOT to use pgvector:**
- Need ultra-low latency (< 50ms) for real-time applications
- Require built-in distributed clustering (need separate orchestration anyway)
- Building a multi-tenant SaaS (need sharded/clustered setup)

---

### Alternative: Qdrant for Pure Vector Performance

If the team prefers a **dedicated vector database** over embedding in relational DB, choose **Qdrant**:

- **Best for**: Teams with 100M+ vectors, need filter-aware queries
- **Setup**: Docker + ~2GB RAM
- **Cost**: Free self-hosted (or $49/mo cloud tier)

---

### Implementation Recommendation

**Start with pgvector approach:**

```bash
# Setup PostgreSQL + pgvector
# Using Railway: https://railway.app/
# or Supabase: free tier available

# Install TypeScript driver
npm install pg
# For vector operations: built-in to PostgreSQL 15+
# No extra package needed!
```

**Recommended tech stack for Phase 1:**
- **DB**: Neon Postgres (free tier) + pgvector extension
- **Driver**: `@neondatabase/serverless` (PostgREST compatible) or standard `pg`
- **Embeddings**: Cohere/Google/Orcalextra (via LangChain.js)
- **Storage**: Local file system for document chunks

---

## Migration Path (Future Considerations)

| Phase | Technology | When to Migrate |
|-------|------------|-----------------|
| 1️⃣ MVP | pgvector | Current recommendation |
| 2️⃣ Growth (10M+ vectors) | pgvector with sharding or → Qdrant | If scaling issues appear |
| 3️⃣ Enterprise (>100M vectors) | Milvus cloud or specialized vector DB | When scale demands it |

---

## Appendix: Quick Reference Tables

### Similarity Distance Metrics

| Metric | Formula | Use Case | Normalized (0-1) |
|--------|---------|----------|-------------------|
| **Cosine** | `dot(A,B) / (||A|| * ||B||)` | Most common for embeddings | Yes |
| **Euclidean (L2)** | `√Σ(a_i - b_i)²` | Small dimension vectors | Yes |
| **Manhattan** | `Σ\|a_i - b_i\|` | High dimension, sparse data | No |

### Recommended Configuration for 1536-dim Embeddings (e.g., text-embedding-3-small)

| Database | Index Type | m (HNSW) | ef_construction | Search ef |
|----------|-----------|----------|-----------------|-----------|
| pgvector | HNSW | 32-64 | 200-512 | 128-256 |
| ChromaDB | HNSW | 32 | 128 | 64-128 |
| Qdrant | HNSW | 32 | 200-512 | 128 |

---

## Resources

- **pgvector Docs**: https://github.com/pgvector/pgvector
- **ChromaDB Docs**: https://docs.trychroma.com
- **Qdrant Docs**: https://qdrant.tech/documentation
- **Weaviate Docs**: https://weaviate.io/developers/weaviate
- **Milvus Docs**: https://milvus.io/docs

---

*Generated: 2026-11-01 | Version: 1.0*
