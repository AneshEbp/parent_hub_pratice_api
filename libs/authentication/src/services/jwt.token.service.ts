import { HashHelper } from '@app/common/helpers/hash.helper';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Enhanced JWT Token Service with improved security measures
 */
@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates JWT token pair with enhanced security
   * @param payload Token payload
   * @param options Token options
   * @returns Token pair with expiration dates
   */
  generateTokenPair(
    payload: any,
    options: {
      accessTokenSecret: string;
      accessTokenExpiryMs: string;
      refreshTokenSecret: string;
      refreshTokenExpiryMs: string;
    },
  ): {
    accessToken: string;
    accessTokenExpiresIn: Date;
    refreshToken: string;
    refreshTokenExpiresIn: Date;
  } {
    try {
      const {
        accessTokenSecret,
        accessTokenExpiryMs,
        refreshTokenSecret,
        refreshTokenExpiryMs,
      } = options;

      // Validate secrets
      if (!accessTokenSecret || !refreshTokenSecret) {
        throw new Error('Token secrets are required');
      }

      // Add security claims
      const enhancedPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000), // Issued at
        // jti: HashHelper.generateSecureToken(16), // JWT ID for token tracking
        iss: 'ebthemes-api', // Issuer
        aud: 'ebthemes-client', // Audience
      };

      const access_token = this.jwtService.sign(enhancedPayload, {
        secret: accessTokenSecret,
        expiresIn: Number(accessTokenExpiryMs),
        algorithm: 'HS256', // Explicitly specify algorithm
      });

      const refresh_token = this.jwtService.sign(enhancedPayload, {
        secret: refreshTokenSecret,
        expiresIn: Number(refreshTokenExpiryMs),
        algorithm: 'HS256',
      });

      const currentDate = new Date();
      return {
        accessToken: 'Bearer ' + access_token,
        accessTokenExpiresIn: new Date(
          currentDate.getTime() + Number(accessTokenExpiryMs),
        ),
        refreshToken: refresh_token,
        refreshTokenExpiresIn: new Date(
          currentDate.getTime() + Number(refreshTokenExpiryMs),
        ),
      };
    } catch (error) {
      console.error('Token generation error:', error);
      throw new HttpException(
        'Token generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generates biometric token with enhanced security
   * @param payload Token payload
   * @param options Token options
   * @returns Biometric token with expiration date
   */
  generateTokenForBiometric(
    payload: any,
    options: {
      biometricTokenSecret: string;
      biometricTokenExpiryMs: string;
    },
  ): {
    biometricToken: string;
    biometricTokenExpiresIn: Date;
  } {
    try {
      const { biometricTokenSecret, biometricTokenExpiryMs } = options;

      if (!biometricTokenSecret) {
        throw new Error('Biometric token secret is required');
      }

      // Enhanced biometric payload
      const enhancedPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti: HashHelper.generateSecureToken(16),
        iss: 'ebthemes-api',
        aud: 'ebthemes-biometric',
        type: 'biometric', // Token type identifier
      };

      const biometric_token = this.jwtService.sign(enhancedPayload, {
        secret: biometricTokenSecret,
        expiresIn: Number(biometricTokenExpiryMs),
        algorithm: 'HS256',
      });

      const currentDate = new Date();
      return {
        biometricToken: biometric_token,
        biometricTokenExpiresIn: new Date(
          currentDate.getTime() + Number(biometricTokenExpiryMs),
        ),
      };
    } catch (error) {
      console.error('Biometric token generation error:', error);
      throw new HttpException(
        'Biometric token generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifies token with enhanced security checks
   * @param token Token to verify
   * @param secret Secret key
   * @returns Decoded token payload
   */
  async verifyToken(token: string, secret: string): Promise<any> {
    try {
      if (!token || !secret) {
        throw new Error('Token and secret are required');
      }

      const decoded = this.jwtService.verify(token, {
        secret,
        algorithms: ['HS256'], // Only allow HS256 algorithm
      });

      // Additional security checks
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp < now) {
        throw new Error('Token has expired');
      }

      if (decoded.nbf && decoded.nbf > now) {
        throw new Error('Token is not yet valid');
      }

      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new HttpException(
        'Token verification failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // /**
  //  * Generates a secure session token
  //  * @param userId User ID
  //  * @param sessionSecret Session secret
  //  * @returns Session token
  //  */
  // generateSessionToken(userId: string, sessionSecret: string): string {
  //   try {
  //     const payload = {
  //       sub: userId,
  //       iat: Math.floor(Date.now() / 1000),
  //       jti: HashHelper.generateSecureToken(16),
  //       iss: 'ebthemes-api',
  //       aud: 'ebthemes-session',
  //       type: 'session',
  //     };

  //     return this.jwtService.sign(payload, {
  //       secret: sessionSecret,
  //       expiresIn: '24h', // 24 hours
  //       algorithm: 'HS256',
  //     });
  //   } catch (error) {
  //     console.error('Session token generation error:', error);
  //     throw new HttpException('Session token generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // /**
  //  * Blacklists a token (for logout functionality)
  //  * @param token Token to blacklist
  //  * @param secret Secret key
  //  * @returns Blacklist confirmation
  //  */
  // async blacklistToken(token: string, secret: string): Promise<boolean> {
  //   try {
  //     const decoded = await this.verifyToken(token, secret);

  //     // In a real implementation, you would store the JTI in a blacklist database
  //     // For now, we'll just log it
  //     console.log(`Token blacklisted: ${decoded.jti}`);

  //     return true;
  //   } catch (error) {
  //     console.error('Token blacklist error:', error);
  //     return false;
  //   }
  // }
}
