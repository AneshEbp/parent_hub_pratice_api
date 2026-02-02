import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbedderService } from './embedder.service';
import { IntentConfig } from '@app/common/config/intent.config';
import { IntentHelper } from '@app/common/helpers/general_info.helper';

@Injectable()
export class IntentDetectionService implements OnModuleInit {
  private intentPrototypes: typeof IntentConfig.INTENT_PROTOTYPES;
  private intentEmbeddings: Record<string, number[][]> = {};
  private helper: IntentHelper;

  constructor(private readonly embedderService: EmbedderService) {
    this.intentPrototypes = IntentConfig.INTENT_PROTOTYPES;
    this.helper = new IntentHelper();
  }
  /** Precompute embeddings for all prototypes */
  async onModuleInit() {
    for (const [intent, prototypes] of Object.entries(this.intentPrototypes)) {

      const tensor = await this.embedderService.embedText(prototypes); // returns a single Tensor
      // If prototypes is an array of strings, you may need to loop manually
      // Here we assume embedText returns a single Tensor for one string
      this.intentEmbeddings[intent] = Array.isArray(prototypes)
        ? prototypes.map((_, i) => Array.from((tensor as any).data)) // same embedding repeated per prototype
        : [Array.from((tensor as any).data)];
    }
  }

  /**
   * Detect intent using combined rule-based and semantic similarity
   * Returns [intentName, confidenceScore]
   */
  async detectIntent(text: string): Promise<[string, number]> {
    const t = text.toLowerCase();

    // 1️⃣ Check if general info
    if (this.helper.isGeneralInfo(t)) {
      return ['GENERAL_INFO', 0.95];
    }

    // 2️⃣ Rule-based scoring
    const intentScores: Record<string, number> = {};
    for (const [intent, cfg] of Object.entries(IntentConfig.INTENT_PATTERNS)) {
      let score = 0;

      for (const k of cfg.keywords) {
        if (t.includes(k)) {
          // mimic: f" {k} " in f" {t} "
          const wholeWord = ` ${t} `
            .toLowerCase()
            .includes(` ${k.toLowerCase()} `);

          if (wholeWord) {
            score += 1.0;
          } else {
            score += 0.5;
          }
        }
      }
      if (score > 0) {
        intentScores[intent] = (score / cfg.keywords.length) * cfg.weight;
      }
    }

    let ruleIntent: string;
    let ruleScore: number;
    if (Object.keys(intentScores).length > 0) {
      // Pick intent with max score
      const entry = Object.entries(intentScores).reduce((a, b) =>
        b[1] > a[1] ? b : a,
      );
      ruleIntent = entry[0];
      ruleScore = entry[1];
    } else {
      ruleIntent = 'GENERAL_INFO';
      ruleScore = 0.5;
    }

    // 3️⃣ Semantic similarity1
    const emb = await this.embedderService.embedText([text]); // returns number[][]
    let bestSemIntent = 'GENERAL_INFO';
    let bestSemScore = 0.0;

    for (const [k, protoEmb] of Object.entries(this.intentEmbeddings)) {
      // cosine similarity between emb[0] and each prototype
      const scores = protoEmb.map((pe) => this.cosineSim(emb[0], pe));
      const maxScore = Math.max(...scores);
      if (maxScore > bestSemScore) {
        bestSemScore = maxScore;
        bestSemIntent = k;
      }
    }

    // 4️⃣ Combine rule-based + semantic
    if (bestSemIntent === ruleIntent) {
      const combinedScore = Math.min(ruleScore + bestSemScore * 0.3, 1.0);
      return [ruleIntent, parseFloat(combinedScore.toFixed(3))];
    }

    return [ruleIntent, parseFloat(ruleScore.toFixed(3))];
  }

  /** Helper: cosine similarity between two vectors */
  private cosineSim(a: number[], b: number[]): number {
    let dot = 0,
      magA = 0,
      magB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }

    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}
