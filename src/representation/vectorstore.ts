import { Pool } from 'pg';
import { FileMetadata } from '../types/chunk';

/**
 * PostgreSQL implementation for Vector Storage using pgvector.
 */
export class PgVectorStore {
  private pool: Pool;
  private tableName: string;

  constructor(connectionString: string, tableName: string = 'documents') {
    this.pool = new Pool({
      connectionString,
    });
    this.tableName = tableName;
    this.initialize();
  }

  /**
   * Ensure the table and vector index exist.
   */
  private async initialize() {
    try {
      // Enable the vector extension
      await this.pool.query(`CREATE EXTENSION IF NOT EXISTS vector`);

      // Ensure the table exists
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id UUID PRIMARY KEY,
          content TEXT,
          embedding VECTOR(1536), -- Default for text-embedding-3-small
          metadata JSONB
        );
      `);
      // Ensure the index exists
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS ${this.tableName}_vec_idx ON ${this.tableName} USING hnsw (embedding vector_cosine_ops)
      `);
      console.log(`Verified ${this.tableName} table and index.`);
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  /**
   * Adds a chunk to the database.
   * @param id - Unique identifier for the chunk.
   * @param content - The text content.
   * @param embedding - The vector representation.
   * @param metadata - Metadata (source, etc.)
   */
  async add(
    id: string,
    content: string,
    embedding: number[],
    metadata: Record<string, any>
  ): Promise<void> {
    const query = `
      INSERT INTO ${this.tableName} (id, content, embedding, metadata)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata;
    `;

    const values = [id, content, embedding, JSON.stringify(metadata)];
    await this.pool.query(query, values);
  }

  /**
   * Queries the database for the nearest neighbors.
   * @param queryVector - The vector to search against.
   * @param topK - Number of results to return.
   */
  async query(queryVector: number[], topK: number = 5): Promise<any[]> {
    const queryText = `
      SELECT id, content, metadata
      FROM ${this.tableName}
      ORDER BY embedding <=> $1
      LIMIT $2;
    `;

    const res = await this.pool.query(queryText, [queryVector, topK]);
    return res.rows;
  }

  /**
   * Close the database connection pool.
   */
  async close() {
    await this.pool.end();
  }
}
