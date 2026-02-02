import { Injectable, Inject } from '@nestjs/common';
import { ConfigOptions } from '../config/config.options';
import {
  SocialAuthParams,
  SocialAuthProvider,
} from '../interfaces/social-auth.types';
import { MODULE_OPTIONS_TOKEN } from '../social-auth.module-definition';
import AppleAuthService from './apple-auth.service';
import GoogleAuthService from './google-auth.service';
import FacebookAuthService from './facebook-auth.service';
import TiktokAuthService from './tiktok-auth.service';

@Injectable()
export class SocialAuthService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly configOptions: ConfigOptions,
  ) {}

  async verifyToken(params: SocialAuthParams) {
    const { idToken, socialAuthProvider } = params;
    if (socialAuthProvider === SocialAuthProvider.apple) {
      return AppleAuthService.verifyToken(idToken, {
        appleClientId: this.configOptions.appleClientId,
      });
    }
    if (socialAuthProvider === SocialAuthProvider.google) {
      return GoogleAuthService.getGoogleDetail(idToken, {
        googleClientId: this.configOptions.googleClientId,
      });
    }
    if (socialAuthProvider === SocialAuthProvider.facebook) {
      return FacebookAuthService.getFacebookDetails(idToken, {
        facebookClientSecret: this.configOptions.facebookClientSecret,
        facebookScopes: this.configOptions.facebookScopes,
      });
    }
    if (socialAuthProvider === SocialAuthProvider.tiktok) {
      return TiktokAuthService.getTikTokDetails(idToken, {
        tiktokClientKey: this.configOptions.tiktokClientKey,
        tiktokClientSecret: this.configOptions.tiktokClientSecret,
      });
    }
  }
}
