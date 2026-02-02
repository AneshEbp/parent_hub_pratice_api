import { HttpService } from '@nestjs/axios';
import {
  TIKTOK_GRANT_TYPE,
  TIKTOK_TOKEN_INFO_URL,
  TIKTOK_USER_INFO_URL,
} from '../config/config.constants';
import { TiktokAuthConfig } from '../config/config.options';
import { firstValueFrom } from 'rxjs';

class TiktokAuthService {
  private readonly httpService: HttpService;
  constructor() {
    this.httpService = new HttpService();
  }
  /**
   * @param {string} code
   * @returns tiktok user info
   */
  async getTikTokDetails(code: string, tiktokAuthConfig: TiktokAuthConfig) {
    let response = await this.httpService.axiosRef.get(TIKTOK_TOKEN_INFO_URL, {
      params: {
        client_key: tiktokAuthConfig.tiktokClientKey,
        client_secret: tiktokAuthConfig.tiktokClientSecret,
        grant_type: TIKTOK_GRANT_TYPE,
        code,
      },
    });
    if (response?.data?.message !== 'success') {
      throw new Error(response.data?.data?.description);
    }
    // if (response?.data?.data?.open_id) {
    //   response = await this.httpService
    //     .post(TIKTOK_USER_INFO_URL, {
    //       access_token: response.data.data?.access_token,
    //       open_id: response.data.data.open_id,
    //       fields: ['open_id', 'union_id', 'avatar', 'display_name'],
    //     })
    //     .toPromise();
    // }

    if (response?.data?.data?.open_id) {
      response = await firstValueFrom(
        this.httpService.post(TIKTOK_USER_INFO_URL, {
          access_token: response.data.data?.access_token,
          open_id: response.data.data.open_id,
          fields: ['open_id', 'union_id', 'avatar', 'display_name'],
        }),
      );
    }
    if (!response?.data?.data?.user) {
      throw new Error(response.data.data?.description);
    }
    return response.data.data.user;
  }
}

export default new TiktokAuthService();
