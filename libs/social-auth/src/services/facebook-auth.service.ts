import crypto = require('crypto');
import { HttpService } from '@nestjs/axios';
import {
  APPSECRET_PROOF_DIGEST_FORMAT,
  CREATE_HMAC_ALG,
  FACEBOOK_GRAPH_API_ME,
} from '../config/config.constants';
import { FacebookAuthConfig } from '../config/config.options';
import { BadRequestException } from '@nestjs/common';

export class FacebookAuthService {
  private readonly httpService: HttpService;
  constructor() {
    this.httpService = new HttpService();
  }
  /**
   * @param body
   * @returns
   */
  async getFacebookDetails(accessToken: string, facebookAuthConfig: FacebookAuthConfig) {
    try {
      const appSecret = facebookAuthConfig.facebookClientSecret;
      const fields = facebookAuthConfig.facebookScopes;
      const appsecret_proof = crypto
        .createHmac(CREATE_HMAC_ALG, appSecret)
        .update(accessToken)
        .digest(APPSECRET_PROOF_DIGEST_FORMAT);
      const response: any = await this.httpService.axiosRef.get(FACEBOOK_GRAPH_API_ME, {
        params: {
          fields: fields.join(','),
          access_token: accessToken,
          appsecret_proof,
        },
      });
      return response.data;
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }
}

export default new FacebookAuthService();
