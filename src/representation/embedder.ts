import { EmbeddingService } from './types';

/**
 * Ollama implementation of the EmbeddingService.
 * Connectes to the local Ollama instance.
 */
export class OllamaEmbedder implements EmbeddingService {
  private readonly endpoint: string;
  private readonly model: string;

  constructor(model: string = 'qwen3-embedding:0.6b', endpoint: string = 'http://localhost:11434') {
    this.model = model;
    this.endpoint = endpoint;
  }

  /**
   * Generates a vector embedding for the given text.
   * @param text - The text to embed.
   * @returns A promise of the vector (array of numbers).
   */
  async embed(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new Error('Cannot embed an empty string');
    }

    try {
      const response = await fetch(`${this.endpoint}/api/embeddings`, {
        method: 'POST',
        body: JSON.stringify({
          model: this.model,
          input: text,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ollama Error (${response.status}): ${errorText}`);
        throw new Error(`Ollama error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // DEBUG: Print everything Ollama sends back
      console.log('--- Ollama Raw Response ---');
      console.log(JSON.stringify(data));
      console.log('---------------------------');

      if (data.embeddings && Array.isArray(data.embeddings) && data.embeddings.length > 0) {
        return data.embeddings[0];
      } else if (data.embedding && Array.isArray(data.embedding)) {
        return data.embedding;
      } else {
        throw new Error(`Ollama returned an empty embedding array. Received: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Embedder Exception:', error);
      throw error;
    }
  }
}
