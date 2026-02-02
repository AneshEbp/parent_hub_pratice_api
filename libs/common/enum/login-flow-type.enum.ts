import { registerEnumType } from '@nestjs/graphql';

export enum LoginFlowType {
  otp = 'otp',
  link = 'link',
}

registerEnumType(LoginFlowType, {
  name: 'LoginFlowType',
});
