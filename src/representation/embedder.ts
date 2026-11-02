/**
 * Interface for embedding services.
 */
export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
}

/**
 * Ollama implementation of the EmbeddingService.
 * Connects to the local Ollama instance.
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
        throw new Error(`Ollama error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // Ollama returns embeddings in a 'embeddings' array
      return data.embeddings[0];
    } catch (error) {
      console.error('Error generating embedding via Ollama:', error);
      throw error;
    }
  }
}
