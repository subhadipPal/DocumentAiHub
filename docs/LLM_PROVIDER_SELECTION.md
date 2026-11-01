# LLM Provider Selection for Document AI Hub

## Overview

This document provides a comprehensive comparison of LLM and embedding providers for building a RAG/MCP document grounding system in TypeScript/Node.js. The selection considers cost, latency, quality tradeoffs, and TypeScript SDK maturity.

---

## Table of Contents
1. [Embedding Models Comparison](#embedding-models-comparison)
2. [LLM Models for RAG](#llm-models-for-rag)
3. [Evaluation Criteria](#evaluation-criteria)
4. [Recommendation Strategy](#recommendation-strategy)

---

## Embedding Models Comparison

Embedding models transform text into vector representations for semantic similarity search and retrieval. Key considerations include dimensionality, quality, latency, and cost.

### 1. OpenAI Text Embeddings

**Models:**
- `text-embedding-3-large` (3072 dimensions)
- `text-embedding-3-small` (1536 dimensions)

| Model | Dimensions | Cost (1M tokens) | Latency | Quality | TypeScript SDK |
|-------|------------|------------------|---------|---------|----------------|
| 3-large | 3072 | \$0.02 | Slow (~2s) | ⭐⭐⭐⭐⭐ | Full |
| 3-small | 1536 | \$0.000125 | Fast (~0.5s) | ⭐⭐⭐⭐ | Full |

**Pros:**
- Industry-leading embedding quality
- Mature and well-documented SDK (`@langchain/openai`, `openai`)
- Excellent for complex, nuanced queries
- Good support for metadata filtering

**Cons:**
- Higher cost than alternatives for large volumes
- Latency can be a bottleneck for real-time applications

**Use Case:** Production-grade RAG with high accuracy requirements.

### 2. Cohere Embed Models

**Models:**
- `embed-3` (latest)
- `embed-4` (newest, improved)

| Model | Dimensions | Cost (1M tokens) | Latency | Quality | TypeScript SDK |
|-------|------------|------------------|---------|---------|----------------|
| embed-v3.0 | 1024/384 | \$0.0001-0.0002 | Fast | ⭐⭐⭐⭐⭐ | Full |
| embed-4 | 1024 | $~0.00015 | Fast | ⭐⭐⭐⭐⭐ | Full |

**Pros:**
- Competitive pricing (lower than OpenAI)
- Excellent for multi-lingual support
- Strong performance on semantic tasks
- `cohere` package available for Node.js
- Good rate limits for production scale

**Cons:**
- Slightly newer ecosystem compared to OpenAI
- Fewer integration examples in open-source RAG repos

**Use Case:** Cost-sensitive production deployments, multi-language applications.

### 3. HuggingFace Inference API

**Models (Examples):**

| Model | Dimensions | Cost (1M tokens) | Latency | Quality | TypeScript SDK |
|-------|------------|------------------|---------|---------|----------------|
| `thenlper/gte-large` | 768 | \$0.00013 | Fast | ⭐⭐⭐⭐ | Full |
| `sentence-transformers/all-MiniLM-L6-v2` | 384 | Free tier available | Fast | ⭐⭐⭐ | Full |
| `BAAI/bge-large-en-v1.5` | 1024 | Pay-as-you-go | Moderate | ⭐⭐⭐⭐⭐ | Full |

**Pros:**
- Vast model selection (10,000+ models)
- Can fine-tune models for domain-specific tasks
- Free tier available for development/testing
- Community-driven ecosystem

**Cons:**
- Variable quality across models (must test)
- Rate limits can be restrictive on free tier
- Self-managed hosting options add operational complexity

**Use Case:** Development/prototyping, custom domain embeddings.

### 4. Other Options

#### Google Vertex AI Embeddings

| Model | Dimensions | Cost | Latency | Quality | TypeScript SDK |
|-------|------------|-------|---------|---------|----------------|
| `text-embedding-004` | 768 | $5/1M tokens | Fast | ⭐⭐⭐⭐ | Full (`@google-cloud/vertexai`) |

**Pros:**
- Strong enterprise integration (Google Workspace)
- Vectors stored in Cloud Storage/AI Platform
- Good multi-language support

**Cons:**
- Higher cost for embedding-only use
- Smaller community adoption

#### AWS Bedrock Embeddings

| Model | Dimensions | Cost | Latency | Quality | TypeScript SDK |
|-------|------------|-------|---------|---------|----------------|
| `amazon.titan-embed-text-v2` | 512/1024 | $0.0001-0.0002 | Fast | ⭐⭐⭐⭐ | Full (`@aws-sdk`) |
| `cohere.embed-english-v3` (via Bedrock) | - | - | - | - | - |

**Pros:**
- Serverless, fully managed
- Integrates with AWS ecosystem

**Cons:**
- Generally higher cost than direct APIs
- Abstracted away specific model choices

---

## LLM Models for RAG

For response generation in a RAG system, models must excel at grounding answers in retrieved context and minimizing hallucinations.

### 1. Anthropic Claude 3 Series

| Model | Context Window | Cost (1M tokens) | Latency | Hallucination Rate | TypeScript SDK |
|-------|----------------|------------------|---------|--------------------|----------------|
| `claude-3-5-sonnet` | 200K | $3.00 (input)/$15.00 (output) | Moderate (~5s) | Low | Full (`@anthropic/ai`) |
| `claude-3-opus` | 200K | $15.00/$75.00 | Slow | Lowest | Full |
| `claude-3-haiku` | 200K | $0.25/$1.25 | Fast | Moderate | Full |

**Pros:**
- **Exceptional grounding accuracy** - best at staying faithful to retrieved context
- Strong instruction following
- Excellent for long-context documents (up to 200K tokens)
- Lower hallucination rates on grounded tasks
- Mature Node.js SDK (`@anthropic/ai`)

**Cons:**
- Higher cost than competitors
- Slower latency than GPT models
- Smaller ecosystem compared to OpenAI

**Use Case:** **Recommended for production RAG** where accuracy and grounding are critical.

### 2. OpenAI GPT Series

| Model | Context Window | Cost (1M tokens) | Latency | Hallucination Rate | TypeScript SDK |
|-------|----------------|------------------|---------|--------------------|----------------|
| `gpt-4o` | 128K | $5.00/$15.00 | Fast (~2s) | Low-Moderate | Full (`openai`) |
| `gpt-4o-mini` | 128K | $0.15/$0.60 | Very Fast (<0.5s) | Moderate | Full |
| `o1-preview` | 128K | $15.00/$60.00 | Slow (~3-4min) | Low | Full |

**Pros:**
- Fast inference speed
- Strong overall capabilities
- Large community adoption
- Excellent TypeScript/Node.js SDK maturity (`openai` package)

**Cons:**
- Higher cost for o1 models
- Can hallucinate more than Claude on grounded tasks
- Context window less than Claude 3.5

**Use Case:** Applications prioritizing speed/cost over maximum accuracy.

### 3. Google Gemini

| Model | Context Window | Cost (1M tokens) | Latency | Hallucination Rate | TypeScript SDK |
|-------|----------------|------------------|---------|--------------------|----------------|
| `gemini-2.0-pro` | 2M | $2.50/$10.00 | Moderate | Low-Moderate | Full (`@google/generative-ai`) |
| `gemini-1.5-flash` | 1M | $0.35/$1.75 | Fast | Moderate | Full |
| `gemini-1.5-pro` | 1M | $2.00/$8.00 | Moderate | Low | Full |

**Pros:**
- **Massive context windows** (up to 2M tokens in Gemini 2.0)
- Competitive pricing at scale
- Strong multimodal capabilities

**Cons:**
- SDK still maturing compared to OpenAI/Anthropic
- Mixed grounding performance on RAG tasks
- Variable latency depending on model tier

**Use Case:** Long-document processing, multilingual applications.

---

## Evaluation Criteria

### 1. Embedding Quality on Semantic Similarity

**Testing Methodology:**
```typescript
// Example evaluation script for production
import { OpenAIEmbeddings } from 'langchain';
import { HNSWLibRetriever } from 'langchain';

// Benchmark queries against ground truth similarity
const benchmarkQueries = [
  "What is the purpose of document chunking in RAG?",
  "Explain semantic search vs keyword matching",
  // ... more test cases
];

// Evaluate embeddings using cosine similarity
async function evaluateEmbeddings(modelName: string) {
  const embeddings = await getEmbeddings(modelName);
  return calculateSimilarity(embeddings, groundTruthQueries);
}
```

**Quality Metrics:**
- **Cosine Similarity** on test benchmarks (MTEB, STS-B)
- Top-K retrieval accuracy
- Cross-lingual similarity support
- Performance on domain-specific terminology

**Recommended Benchmarks:**
1. **MTEB (Massive Text Embedding Benchmark)** - 52 different tasks
2. **STRENGHTS** - Real-world semantic textual similarity
3. **Custom RAG evaluation** - Your own test corpus with ground truth

### 2. LLM Grounding Accuracy

**Grounded QA Testing:**
```typescript
// Evaluate hallucination rates on grounded responses
async function evaluateGrounding(model: string, context: string, query: string) {
  const response = await generateResponse(model, { 
    context: [context],
    query,
    instructions: "Answer ONLY from the provided context. Mark if answer is not found."
  });
  
  return {
    grounded: response.factualGrounding(context),
    hallucinated: response.hallucinationScore > 0.3
  };
}
```

**Key Metrics:**
- **Faithfulness Score** - Does response align with retrieved context?
- **Relevance Score** - Is answer directly responsive to query?
- **Hallucination Rate** - Percentage of unsupported claims
- **Context Utilization** - Uses provided information effectively

### 3. Response Latency

**Measurement:**
```typescript
const latency = await measureLatency(
  model: string, 
  temperature: number,
  contextLength: number
);
```

**Typical Latencies (1K token response):**
- GPT-4o-mini: ~200-500ms
- OpenAI text-embedding-3-small: ~300-600ms
- Cohere embed-v3: ~150-300ms
- Claude 3 Sonnet: ~3-5s (generation)
- Gemini Flash: ~800-1200ms

### 4. Cost Per Token

**Comparison Table:**

| Service | Embedding Input ($/M tokens) | LLM Input ($/M tokens) | LLM Output ($/M tokens) |
|---------|------------------------------|------------------------|-------------------------|
| OpenAI text-embedding-3-small | $0.000125 | - | - |
| OpenAI gpt-4o | - | $5.00 | $15.00 |
| Cohere embed-v3 | $0.0001-$0.0002 | - | - |
| Anthropic claude-3-sonnet | - | $3.00 | $15.00 |
| Gemini 1.5 Flash | - | $0.35 | $1.75 |

### 5. TypeScript SDK Maturity

**SDK Comparison:**

| Provider | Package | Documentation | v2+ Support | Async Native | Type Safety |
|----------|---------|---------------|-------------|--------------|-------------|
| OpenAI | `openai` | Excellent | ✅ | ✅ | ✅ |
| Anthropic | `@anthropic/ai` | Excellent | ✅ | ✅ | ✅ |
| Cohere | `cohere` | Good | ✅ | ✅ | ✅ |
| Google | `@google/generative-ai` | Very Good | ✅ | ✅ | ✅ |
| HuggingFace | `huggingface.js` | Moderate | ⚠️ | ✅ | ⚠️ (Beta) |

**Recommendation:** All major providers offer fully type-safe, async-native SDKs. OpenAI and Anthropic have the most production-tested SDKs.

### 6. Rate Limits and Quotas

| Provider | Free Tier | Paid Tiers (typical) | Burst Handling |
|----------|-----------|----------------------|----------------|
| OpenAI | 1M tokens/mo (free tier limited) | $5-50K mo, scalable | ✅ Good |
| Anthropic | No free tier | $2-50K mo, API keys needed | ✅ Moderate |
| Cohere | Limited free credits | Flexible tiers | ✅ Excellent |
| Google | Free trial credits | Pay-as-you-go + quotas | ✅ Good |
| HuggingFace | 30k req/mo free | Paid tiers available | ⚠️ Variable |

---

## Recommendation Strategy

### Suggested Production Combinations

#### Option A: **Premium Accuracy** (Recommended for Production)

```typescript
// Configuration example
const config = {
  embeddingProvider: {
    type: 'openai',
    model: 'text-embedding-3-small', // Balance of cost/performance
    dimensions: 1536
  },
  llmProvider: {
    type: 'anthropic',
    model: 'claude-3-sonnet-20241022',
    temperature: 0.1, // Low for grounded responses
    maxTokens: 2000
  }
};
```

**Pros:**
- Best grounding accuracy in the market
- Reasonable cost (embeddings cheap, LLM moderate)
- Both have mature TypeScript SDKs

**Cost Estimate:** ~$15-30 per 1K user queries (depends on document size)

#### Option B: **Cost Optimized Production**

```typescript
const config = {
  embeddingProvider: {
    type: 'cohere',
    model: 'embed-v3-small',
    dimensions: 1024
  },
  llmProvider: {
    type: 'openai',
    model: 'gpt-4o-mini', // Faster, cheaper
    temperature: 0.2,
    maxTokens: 1500
  }
};
```

**Pros:**
- Lower operational cost
- Good balance of speed and quality
- Scalable for high-volume applications

#### Option C: **Long Context Specialist**

```typescript
const config = {
  embeddingProvider: {
    type: 'cohere',
    model: 'embed-v3-large',
    dimensions: 1024
  },
  llmProvider: {
    type: 'google',
    model: 'gemini-2.0-pro-exp',
    temperature: 0.1
  }
};
```

**Use when:** Processing documents >100K tokens, multilingual support required

### Development/Free Tier Options

#### Minimum Viable Setup

```typescript
// All free tier / low cost
const devConfig = {
  embeddingProvider: {
    type: 'huggingface',
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    useCachedEndpoint: true, // Zero cost for cached models
    providerUrl: 'https://inference-docs-hf.onruntime.com'
  },
  llmProvider: {
    type: 'openai',
    model: 'gpt-4o-mini', // ~$0.15 per 1K tokens
    temperature: 0.2
  }
};

// Or pure HuggingFace (both services)
const freeConfig = {
  embeddingProvider: {
    type: 'huggingface',
    model: 'BAAI/bge-small-en-v1.5'
  },
  llmProvider: {
    type: 'huggingface',
    model: 'meta-llama/Llama-3.3-70b-instruct' // if available free
  }
};
```

**Free Tier Limits to Consider:**
- HuggingFace Inference API Free: 30,000 requests/month (rate limited)
- OpenAI Free tier: Expired in most regions (test credits only)
- Anthropic Free trial: Limited time access (~$5 credit)

---

## Cost Optimization Tips

### 1. **Embedding Strategy**

```typescript
// Batch embeddings for multiple documents
async function batchEmbeddings(documents: string[]) {
  if (documents.length > 50) {
    // Split into batches of 50 to avoid rate limits
    const batchSize = 50;
    return createBatchedCalls(documents, batchSize);
  }
  return await getBatchEmbeddings(documents);
}

// Use smaller embeddings for less critical operations
async function getStrategy() {
  return {
    chunkEmbedding: 'text-embedding-3-small', // Cheaper than large
    queryEmbedding: 'text-embedding-3-small'
  };
}
```

**Savings:** Using 1536-dim instead of 3072-dim saves ~50% on embedding costs.

### 2. **LLM Cost Reduction**

```typescript
// Prompt engineering for cost optimization
const optimizedPrompt = `
Given the following context and query, provide a concise answer:

${context}

Query: ${query}

ANSWER ONLY (no explanations):`

// Temperature tuning
// Lower temperature (0.1-0.2) reduces variance and can improve accuracy
// Higher token counts waste money on unnecessary verbosity
```

**Tips:**
- Use `gpt-4o-mini` for initial retrieval, upgrade only if quality insufficient
- Implement response length limits to avoid over-generation
- Cache responses for identical queries using semantic keying

### 3. **Hybrid Caching Strategy**

```typescript
class RAGCache {
  async getOrGenerate(query: string) {
    // Semantic cache key generation
    const cacheKey = await this.getSemanticHash(query);
    
    if (await this.hasEntry(cacheKey)) {
      return await this.cache[cacheKey]; // Free retrieval
    }
    
    // Generate and cache
    const response = await this.generateResponse(query);
    await this.cache.set(cacheKey, response);
    return response;
  }
}

// Redis/ElastiCache with L2 semantic cache
const redisClient = new Redis({ url: process.env.REDIS_URL });
```

### 4. **Tiered Model Selection**

```typescript
// Simple model routing based on query complexity
async function generateResponse(query: string, metadata?: {
  isCritical?: boolean,
  userTier?: 'free' | 'basic' | 'pro',
  latencyConstraint?: number
}) {
  if (isCritical || userTier === 'pro') {
    return await client('anthropic-sonnet').chat(message); // High quality
  } else if (metadata.latencyConstraint > 500) {
    return await client('openai-gpt4o-mini').chat(message); // Fast path
  } else {
    return await client('openai-gpt4o').chat(message); // Balanced
  }
}
```

### 5. **Monitoring and Adjustment**

```typescript
interface UsageMetrics {
  totalTokens: number;
  costThisMonth: number;
  avgLatencyMs: number;
  qualityScore: number; // From evals
}

// Track and alert when hitting budget thresholds
const metrics = {
  openAI: { tokens: 150_000, cost: 7.50 },
  anthropic: { tokens: 80_000, cost: 400.00 } // High output usage!
};

// Auto-suggestion for cheaper model if quality score > threshold
```

---

## Provider-Specific Recommendations

### TypeScript SDK Setup Examples

#### OpenAI (Recommended for LLM)
```bash
npm install openai @langchain/openai
```
```typescript
import { OpenAI } from 'openai';
import { OpenAIEmbeddings } from '@langchain/openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({ 
  model: 'text-embedding-3-small' 
});
```

#### Anthropic (Recommended for RAG Generation)
```bash
npm install @anthropic/ai
```
```typescript
import { Anthropic } from '@anthropic/ai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: { 'anthropic-beta': 'token-2024-11-06' } // Latest tokens
});

// System instruction for grounding
const systemPrompt = `You are a helpful assistant that answers questions based ONLY on the provided context. If the answer cannot be found in the context, state that clearly rather than making up information.`;
```

#### Cohere (Recommended for Embeddings)
```bash
npm install cohere
```
```typescript
import { Cohere } from 'cohere';

const cohere = new Cohere({
  apiKey: process.env.COHERE_API_KEY,
  temperature: 0.2 // For embeddings
});

// Get embeddings for a query
const response = await cohere.embed({
  texts: ['Your search query'],
  input_type: 'classification' // Optimize for search classification
});
```

#### Google Gemini
```bash
npm install @google/generative-ai
```
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: { temperature: 0.1 } // Low for accuracy
});
```

### Rate Limit Best Practices

```typescript
// Implement backoff for rate limiting
class RateLimitHandler {
  async safeCall<T>(func: () => Promise<T>): Promise<T> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await func();
      } catch (error) {
        if (error.code === 429 || error.status === 429) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Rate limited, retrying in ${delay}ms`);
          await sleep(delay);
        } else {
          throw error;
        }
      }
    }
  }
}
```

---

## Summary & Final Recommendation

### Production-Ready Stack (Recommended)

| Component | Provider | Model | Rationale |
|-----------|----------|-------|-----------|
| Embeddings | OpenAI | `text-embedding-3-small` | Best overall quality, mature SDK, good latency |
| LLM Generation | Anthropic | `claude-3-sonnet` | Lowest hallucination rate, best grounding accuracy |

**Why This Combination:**
1. **Cost balance:** ~$0.000125 per embedding × 1K chunks + $0.015 per generated response = moderate total cost
2. **Quality maximized:** OpenAI embeddings + Claude for generation = industry-leading RAG performance
3. **Latency acceptable:** Both providers offer sub-second latency for embeddings, ~5s for generation
4. **TypeScript maturity:** Both SDKs are production-grade with excellent TypeScript support

### Alternative Stacks by Use Case

| Use Case | Embeddings | LLM | Cost/1K Queries |
|----------|------------|-----|-----------------|
| High-volume search | Cohere embed-v3 | GPT-4o-mini | ~$20-25 |
| Long documents | Cohere embed-v3-large | Gemini 2.0-pro | ~$30-35 |
| Budget/Dev | HuggingFace bge-small | GPT-4o-mini | Free + ~$15 |
| Maximum accuracy | OpenAI text-embedding-3-large | Claude Opus | ~$50+ |

### Development Migration Path

1. **Phase 1 (Prototype):** Use HuggingFace free tier for both embeddings and LLM
2. **Phase 2 (Testing):** Migrate embeddings to Cohere, keep open testing on Anthropic
3. **Phase 3 (Production):** 
   - Embeddings: OpenAI text-embedding-3-small (production-ready)
   - Generation: Anthropic Claude Sonnet (best grounding)
4. **Phase 4 (Optimization):** Implement caching, model routing, usage monitoring

---

## References & Resources

### Official Documentation
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Anthropic API](https://docs.anthropic.com/en/api)
- [Cohere Embeddings](https://docs.cohere.com/reference/embed-code-synchronous)
- [Google Gemini](https://ai.google.dev/gemini-api)
- [HuggingFace Inference API](https://huggingface.co/inference-api)

### Evaluation Benchmarks
- [MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard)
- [RAG Evaluation Frameworks](https://github.com/langchain-ai/rank-llms)
- [LLM Guardrails](https://docs.langfuse.com/integrations/guardrails)

### Cost Calculators
- [OpenAI Calculator](https://openai.com/pricing)
- [Anthropic Calculator](https://www.anthropic.com/pricing)
- [Cohere Pricing](https://cohere.com/pricing)

---

*Last updated: November 2024*
