import { Injectable } from '@nestjs/common';
import { FeatureExtractionPipeline, pipeline } from '@xenova/transformers';
@Injectable()
export class EmbedderService {
  private embedder: FeatureExtractionPipeline;
  private readyPromise: Promise<void>;

  constructor() {
    // Initialize embedder once at service creation
    this.readyPromise = this.initializeEmbedder();
  }

  // Load the Xenova model
  private async initializeEmbedder() {
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
    );
  }

  // Ensure embedder is ready
  private async ensureReady() {
    if (!this.embedder) {
      await this.readyPromise;
    }
    return this.embedder;
  }

  /**
   * Generate embeddings for one or more texts
   * @param texts string or string[]
   * @returns embedding array
   */
  async embedText(texts: string | string[]) {
    const embedder = await this.ensureReady();
    const input = Array.isArray(texts) ? texts : [texts];

    const embeddings = await embedder(input, {
      pooling: 'mean', // mean pooling over tokens
      normalize: true, // normalized embeddings like SBERT
    });

    return embeddings;
  }
}
