import { registerEnumType } from '@nestjs/graphql';

export enum VoipNotificationType {
  VOIP_ANDROID = 'VOIP_ANDROID',
  // other types
}

registerEnumType(VoipNotificationType, {
  name: 'VoipNotificationType',
});
