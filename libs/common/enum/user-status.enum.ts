import { registerEnumType } from '@nestjs/graphql';

export enum UserStatus {
  email_verification_pending = 'email_verification_pending',
  email_verified = 'email_verified',
  password_set = 'password_set',
  password_set_pending = 'password_set_pending',
}

registerEnumType(UserStatus, {
  name: 'UserStatus',
});

export enum BusinessEmailTemplateStatus {
  active = 'active',
  draft = 'draft',
  inactive = 'inactive',
}

export enum EmailType {
  SIMPLEEMAIL = 'simple-email',
  FANCYEMAIL = 'fancy-email',
}

registerEnumType(BusinessEmailTemplateStatus, {
  name: 'BusinessEmailTemplateStatus',
});

registerEnumType(EmailType, {
  name: 'EmailType',
});
