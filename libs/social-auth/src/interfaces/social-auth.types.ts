export enum SocialAuthProvider {
  facebook = 'facebook',
  google = 'google',
  apple = 'apple',
  tiktok = 'tiktok',
  twitter = 'twitter',
  github = 'github',
}

export interface SocialAuthParams {
  idToken?: string;
  socialAuthProvider?: SocialAuthProvider;
}

export interface FacebookProfileFields {
  id: string;
  gender: string;
  name: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  birthday: string;
}

export type FacebookUserFields = keyof FacebookProfileFields;

export type FacebookUserResponse<T extends FacebookUserFields> = {
  [P in keyof T]: string;
};
