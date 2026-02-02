import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { VerifyAppleIdTokenResponse } from '../interfaces/apple/verify-idtoken.response';
import { APPLE_BASE_URL, JWKS_APPLE_URI } from '../config/config.constants';
import { AppleAuthConfig } from '../config/config.options';

class AppleAuthService {
  private async getApplePublicKey(kid: string) {
    const client = jwksClient({
      cache: true,
      jwksUri: `${APPLE_BASE_URL}${JWKS_APPLE_URI}`,
    });

    const key = await new Promise<jwksClient.SigningKey>((resolve, reject) => {
      client.getSigningKey(kid, (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
    });
    return key.getPublicKey();
  }

  async verifyToken(
    idToken: string,
    appleAuthConfig: AppleAuthConfig,
  ): Promise<VerifyAppleIdTokenResponse> {
    /**
     * Decode jwt token
     */
    const decoded = jwt.decode(idToken, { complete: true });
    const { kid, alg } = decoded.header;
    /**
     * Fetch Apple's public key for verifying token signature
     */
    const applePublicKey = await this.getApplePublicKey(kid);
    /**
     * Get jwt claim usering apple public key
     */
    const jwtClaims = jwt.verify(idToken, applePublicKey, {
      algorithms: [alg as jwt.Algorithm],
    }) as VerifyAppleIdTokenResponse;
    if (jwtClaims?.iss !== APPLE_BASE_URL) {
      throw new Error(
        `The iss does not match the Apple URL - iss: ${jwtClaims.iss} | expected: ${APPLE_BASE_URL}`,
      );
    }

    const isFounded = []
      .concat(jwtClaims.aud)
      .some((aud) => [].concat(appleAuthConfig.appleClientId).includes(aud));

    /**
     * Convert email_verified and is_private_email to boolean
     */
    if (isFounded) {
      ['email_verified', 'is_private_email'].forEach((field) => {
        if (jwtClaims[field] !== undefined) {
          jwtClaims[field] = Boolean(jwtClaims[field]);
        }
      });

      return jwtClaims;
    }

    throw new Error(
      `The aud parameter does not include this client - is: ${jwtClaims.aud} | expected: ${appleAuthConfig.appleClientId}`,
    );
  }
}

export default new AppleAuthService();
