import { FacebookUserFields } from '../interfaces/social-auth.types';

export type AppleAuthConfig = {
  appleClientId: string[];
};

export type GoogleAuthConfig = {
  googleClientId: string[];
  googleScopes?: string[];
};

export type FacebookAuthConfig = {
  facebookClientSecret: string;
  facebookScopes?: FacebookUserFields[];
};

export type TiktokAuthConfig = {
  tiktokClientKey: string;
  tiktokClientSecret?: string;
  toktokScopes?: string[];
};

export type ConfigOptions = AppleAuthConfig &
  GoogleAuthConfig &
  FacebookAuthConfig &
  TiktokAuthConfig;
