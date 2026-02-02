import { IntentConfig } from "../config/intent.config";

export class IntentHelper {
  private generalPatterns: RegExp[];
  private highUrgency: string[] = IntentConfig.HIGH_URGENCY;
  private mediumUrgency: string[] = IntentConfig.MEDIUM_URGENCY;
  private eventKeywords: string[] = IntentConfig.EVENT_KEYWORDS;
  private assistanceKeywords: string[] = IntentConfig.ASSISTANCE_KEYWORDS;
  private deadlineKeywords: string[] = IntentConfig.DEADLINE_KEYWORDS;
  private positiveWords: string[] = IntentConfig.POSITIVE_WORDS;
  private negativeWords: string[] = IntentConfig.NEGATIVE_WORDS;

  constructor() {
    this.generalPatterns = IntentConfig.GENERAL_INFO_PATTERNS.map(
      (p) => new RegExp(p.source, p.flags || 'i'),
    );
  }

  isGeneralInfo(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length < 15 && trimmed.split(/\s+/).length <= 3) {
      return this.generalPatterns.some((pattern) => pattern.test(trimmed));
    }
    return false;
  }

  /**
   * Compute urgency level based on text and intent
   * Returns [urgencyLevel, keywordsFound]
   */
  computeUrgency(
    text: string,
    intent?: string,
  ): ['HIGH' | 'MEDIUM' | 'LOW', string[]] {
    const textLower = text.toLowerCase();

    // Check high urgency
    const highFound = this.highUrgency.filter((k) =>
      textLower.includes(k.toLowerCase()),
    );
    if (highFound.length > 0 || intent === 'ACCIDENT_INCIDENT') {
      return ['HIGH', highFound];
    }

    // Check medium urgency
    const mediumFound = this.mediumUrgency.filter((k) =>
      textLower.includes(k.toLowerCase()),
    );
    if (mediumFound.length > 0) {
      return ['MEDIUM', mediumFound];
    }

    // Default low
    return ['LOW', []];
  }

  extractEntities(text: string): string[] {
    const entities: string[] = [];

    // Time patterns
    const timePatterns = [
      /\b\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)\b/g,
      /\b\d{1,2}\s*(?:AM|PM|am|pm)\b/g,
    ];

    // Date patterns
    const datePatterns = [
      /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\b/gi,
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}(?:st|nd|rd|th)?\b/gi,
    ];

    // Match times and dates
    for (const pattern of [...timePatterns, ...datePatterns]) {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    }

    // Day references
    const dayRefs = [
      'today',
      'tomorrow',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const textLower = text.toLowerCase();
    for (const day of dayRefs) {
      if (textLower.includes(day)) {
        entities.push(day);
      }
    }

    // Remove duplicates
    return Array.from(new Set(entities));
  }

  extractDateTime(text: string): string | null {
    const entities = this.extractEntities(text);
    return entities.length > 0 ? entities.join(', ') : null;
  }

  /**
   * Check if text contains an event keyword
   * Returns [isEvent, matchedKeyword]
   */
  isEvent(text: string): [boolean, string | null] {
    const textLower = text.toLowerCase();

    for (const keyword of this.eventKeywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        return [true, keyword];
      }
    }

    return [false, null];
  }

  /**
   * Check if text is an assistance request
   * Returns true if any assistance keyword is present or a question containing assistance keyword
   */
  isAssistanceRequest(text: string): boolean {
    const textLower = text.toLowerCase();
    const count = this.assistanceKeywords.filter((k) =>
      textLower.includes(k.toLowerCase()),
    ).length;
    const hasQuestion = text.includes('?');

    return count >= 1 || (hasQuestion && count > 0);
  }

  /**
   * Check if text contains any deadline-related keywords
   * Returns [hasDeadline, matchedKeywords]
   */
  hasDeadline(text: string): [boolean, string[]] {
    const textLower = text.toLowerCase();
    const found = this.deadlineKeywords.filter((k) =>
      textLower.includes(k.toLowerCase()),
    );
    return [found.length > 0, found];
  }

  /**
   * Detect sentiment of a text
   * Returns "POSITIVE", "NEGATIVE", or "NEUTRAL"
   */
  detectSentiment(text: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    const textLower = text.toLowerCase();

    const pos = this.positiveWords.filter((w) =>
      textLower.includes(w.toLowerCase()),
    ).length;
    const neg = this.negativeWords.filter((w) =>
      textLower.includes(w.toLowerCase()),
    ).length;

    if (pos > neg) return 'POSITIVE';
    if (neg > pos) return 'NEGATIVE';
    return 'NEUTRAL';
  }
}
