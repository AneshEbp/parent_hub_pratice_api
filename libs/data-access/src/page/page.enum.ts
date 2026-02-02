import { registerEnumType } from '@nestjs/graphql';

export enum PageType {
  ABOUT = 'About Us',
  GENERIC = 'Generic',
  CONTACT = 'Contact Us',
  TERMS_AND_CONDITION = 'Terms And Conditions',
  PRIVACY_POLICY = 'Privacy Policy',
  // other titles
}
registerEnumType(PageType, { name: 'PageType' });

export enum PageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

registerEnumType(PageStatus, { name: 'PageStatus' });
