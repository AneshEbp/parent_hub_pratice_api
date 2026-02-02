import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

interface IPushNotificationData {
  title: string;
  body: string;
  data: {
    [key: string]: any;
  };
}

@Injectable()
export class FcmService {
  constructor(private readonly configService: ConfigService) {
    const FIREBASE_PARAMS = {
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
      clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
    };
    const FIREBASE_CONFIG = {
      credential: admin.credential.cert(FIREBASE_PARAMS),
    };
    if (!admin.apps.length) {
      admin.initializeApp(FIREBASE_CONFIG);
    }
  }

  async sendPushNotifications(registrationTokens: string[], pushData: IPushNotificationData) {
    if (!registrationTokens.length) return false;

    try {
      const messagePayload: MulticastMessage = {
        data: JSON.parse(JSON.stringify(pushData.data)),

        notification: {
          title: pushData.title,
          body: pushData.body,
        },

        tokens: registrationTokens,
      };
      admin
        .messaging()
        .sendEachForMulticast(messagePayload)
        .then((response) => {
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(registrationTokens[idx]);
              }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
          }

          return true;
        });
    } catch (error: any) {
      console.log(`Error on Sending Push Notification ${error?.msg || error}`);
      throw new HttpException(`Error sending Push Notification ${error?.msg || error}`, 500);
    }
  }
}
