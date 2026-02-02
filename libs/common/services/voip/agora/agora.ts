import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as apn from 'apn';
import { FcmService } from 'libs/fcm';
import { VoipNotificationType } from './voip.enum';
import { AGORA_VOIP_BUNDLE_ID, AGORA_VOIP_KEY_ID, AGORA_VOIP_TEAM_ID } from './constants/agora';

interface ICallData {
  callToken?: string;
  meetingId?: string;
  callerName: string;
  callType: string;
  callerId: string;
  calleeId: string;
  channelName?: string;
}

@Injectable()
export class VoipHelperService {
  private failedCount = 0;
  constructor(
    private readonly fcmService: FcmService, //     private readonly pushNotificationTokenRepo: PushNotificationTokenRepository,
  ) { }

  async sendVoipAndroid(pushTokens: string[], callData: ICallData, serviceProvider: string) {
    const { callToken, meetingId, callType, callerId, calleeId, callerName, channelName } =
      callData;
    return this.fcmService.sendPushNotifications(pushTokens, {
      title: `${callerName}`,
      body: `${callType} call`,
      data: {
        type: VoipNotificationType.VOIP_ANDROID,
        callType,
        callerId,
        calleeId,
        serviceProvider,
        ...(callToken && { callToken, channelName }),
        ...(meetingId && { meetingId }),
      },
    });
  }

  async sendVoipIos(
    voipTokens: string[],
    callData: ICallData,
    serviceProvider: string,
    production = true,
  ): Promise<any> {
    const { callToken, meetingId, callType, callerName, callerId, calleeId, channelName } =
      callData;
    // set failed count 0 if first try in prodcuction mode, next retries in sandbox mode
    if (production) {
      this.failedCount = 0;
    }
    const keyIds = {
      agora: AGORA_VOIP_KEY_ID,
    };
    const teamIds = {
      agora: AGORA_VOIP_TEAM_ID,
    };

    try {
      const options = {
        token: {
          key: process.cwd() + '/EBP_AuthKey_XGUMJ5FP7Y.p8',
          keyId: keyIds[serviceProvider],
          teamId: teamIds[serviceProvider],
        },
        production,
      };

      const apnProvider = new apn.Provider(options);

      const note = new apn.Notification();

      note.expiry = 30; // Expires 30 secs from now.
      note.payload = {
        callType,
        callerName,
        callerId,
        calleeId,
        serviceProvider,
        ...(callToken && { callToken, channelName }),
        ...(meetingId && { meetingId }),
      };
      note.topic = AGORA_VOIP_BUNDLE_ID;

      const notifications = [];
      for (const voipToken of voipTokens) {
        const notification = await apnProvider.send(note, voipToken);
        if (notification?.failed?.length) {
          console.log(notification.failed[0].response);
          notifications.push(voipToken);
        }
      }
      apnProvider.shutdown();

      // if failed try in sandbox mode
      if (notifications.length && this.failedCount < 1) {
        this.failedCount++;
        console.log('Notifications failed for following token(s): ' + notifications.join(','));
        await this.sendVoipIos(
          notifications,
          {
            callToken,
            meetingId,
            callType,
            callerName,
            callerId,
            calleeId,
            channelName,
          },
          serviceProvider,
          false,
        );
      }
      if (notifications.length && this.failedCount >= 1) {
        console.log(
          'Resend Notifications failed for following token(s): ' + notifications.join(','),
        );
      }

      return 'Notification sent';
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NO_CONTENT);
    }
  }
}
