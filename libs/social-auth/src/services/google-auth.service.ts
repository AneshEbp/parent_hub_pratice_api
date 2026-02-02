import { HttpService } from '@nestjs/axios';
import { GoogleAuthConfig } from '../config/config.options';
import { GOOGLE_TOKEN_INFO_URL, GOOGLE_TOKEN_ISS } from '../config/config.constants';
import { VerifyGoogleIdTokenResponse } from '../interfaces/google/verify-idtoken';
import { BadRequestException } from '@nestjs/common';

class GoogleAuthService {
  private readonly httpService: HttpService;
  constructor() {
    this.httpService = new HttpService();
  }
  /**
   * @param body
   * @returns
   */
  async getGoogleDetail(
    idToken: string,
    googleAuthConfig: GoogleAuthConfig,
  ): Promise<VerifyGoogleIdTokenResponse> {
    try {
      const response: any = await this.httpService.axiosRef.get(GOOGLE_TOKEN_INFO_URL, {
        params: {
          id_token: idToken,
        },
      });
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const { iss, exp, aud } = response.data;
      if (GOOGLE_TOKEN_ISS !== iss) {
        throw new Error('Invalid token issuer.');
      }
      /**
       * If aud does not match throw error
       */
      if (!googleAuthConfig.googleClientId.includes(aud)) {
        throw new Error('Failed to verify token');
      }
      /**
       * If token is expired
       */
      if (currentTimeInSeconds > parseInt(exp)) {
        throw new Error('Token has been expired.');
      }

      return response.data;
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }
}

export default new GoogleAuthService();
