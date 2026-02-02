import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepo } from '../repository/base.repo';
import {
  PushNotificationToken,
  PushNotificationTokenDocument,
} from './push-notification-token.schema';

@Injectable()
export class PushNotificationTokenRepository extends BaseRepo<PushNotificationTokenDocument> {
  constructor(
    @InjectModel(PushNotificationToken.name)
    private readonly pushNotificationTokenModel: Model<PushNotificationTokenDocument>,
  ) {
    super(pushNotificationTokenModel);
  }

  async getPushTokensByUserId(userId: string): Promise<string[]> {
    const pushTokenData = await this.pushNotificationTokenModel.find(
      {
        userId,
      },
      {
        deviceId: 1,
        pushToken: 1,
      },
    );
    const pushTokens = pushTokenData?.map((el) => el.pushToken);
    return pushTokens;
  }
}
