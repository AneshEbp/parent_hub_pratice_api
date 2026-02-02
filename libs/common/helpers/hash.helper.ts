import { compareSync, hash, genSalt, hashSync } from 'bcrypt';
import { randomBytes, createHash } from 'crypto';

export const SALT_ROUNDS = 12; // Increased from 10 for better security

export class HashHelper {
  private static readonly saltRounds = SALT_ROUNDS;

  /**
   * Creates a hash of the given text with enhanced security
   * @param {string} text text to be hashed
   * @returns {Promise<string>} hashed text
   */
  static async createHash(text: string): Promise<string> {
    if (!text || text.length === 0) {
      throw new Error('Text to hash cannot be empty');
    }

    const salt = await genSalt(HashHelper.saltRounds);
    return hash(text, salt);
  }

  /**
   * Creates a hash synchronously (use sparingly)
   * @param {string} text text to be hashed
   * @returns {string} hashed text
   */
  static createHashSync(text: string): string {
    if (!text || text.length === 0) {
      throw new Error('Text to hash cannot be empty');
    }

    return hashSync(text, HashHelper.saltRounds);
  }

  /**
   * Compare text with hash text
   * @param {string} text text to be compared
   * @param {string} hashText hash text to be compared with
   * @returns {boolean} true if text and hashText are matched
   */
  static compare(text: string, hashText: string): boolean {
    if (!text || !hashText) {
      return false;
    }

    try {
      return compareSync(text, hashText);
    } catch (error) {
      console.error('Hash comparison error:', error);
      return false;
    }
  }

  /**
   * Generate a secure random token
   * @param {number} length length of the token
   * @returns {string} random token
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string with custom characters
   * @param {number} length length of the string
   * @param {string} charset custom character set
   * @returns {string} random string
   */
  static generateSecureString(
    length: number = 32,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let result = '';
    const bytes = randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }

    return result;
  }

  /**
   * Create SHA-256 hash (for non-password hashing)
   * @param {string} text text to hash
   * @returns {string} SHA-256 hash
   */
  static createSHA256Hash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /**
   * Verify password strength
   * @param {string} password password to check
   * @returns {object} strength analysis
   */
  static analyzePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password should contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password should contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Password should contain at least one number');
    } else {
      score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Password should contain at least one special character');
    } else {
      score += 1;
    }

    if (password.length >= 12) {
      score += 1;
    }

    return {
      score,
      feedback,
      isStrong: score >= 4,
    };
  }

  /**
   * Generate a secure password
   * @param {number} length password length
   * @returns {string} secure password
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
