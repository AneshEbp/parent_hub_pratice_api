import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { PushNotificationTokenRepository, UsersRepository } from '@app/data-access';
import { AGORA_USER_TOKEN_EXPIRY } from '@api/constants';
import { CHANNEL_NAME, CHAT_TYPE, DEVICE_TYPE } from './constants';
import { I18nService } from 'nestjs-i18n';
import { VoipHelperService } from '@app/common/services/voip/agora/agora';
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AgoraService
 * @typedef {AgoraService}
 */
@Injectable()
export class AgoraService {
  /**
   * Creates an instance of AgoraService.
   *
   * @constructor
   * @param {AgoraHelperService} agoraHelperService
   * @param {VoipHelperService} voipHelperService
   * @param {UsersRepository} usersRepository
   * @param {PushNotificationTokenRepository} pushNotificationTokenRepo
   */
  constructor(
    private readonly agoraHelperService: AgoraHelperService,
    private readonly voipHelperService: VoipHelperService,
    private readonly usersRepository: UsersRepository,
    private readonly pushNotificationTokenRepo: PushNotificationTokenRepository,
    private readonly i18nService: I18nService,
  ) {}
  /**
   * @description Create an Agora Token for audio/video call
   * @param userId user id
   * @returns token, channel name and user account id
   */

  async createAgoraToken(userId: string) {
    try {
      const channelName = CHANNEL_NAME; // use dynamic channel name later

      const tokenWithAccount = await this.agoraHelperService.createAgoraCallToken(
        userId,
        channelName,
      );
      return {
        token: tokenWithAccount,
        channelName,
        userAccount: String(userId),
      };
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {string} callerId
   * @param {string} calleeId
   * @param {string} callType
   * @returns {Promise<{ token: any; channelName: any; }>\}
   */
  async initiateAgoraCall(callerId: string, calleeId: string, callType: string) {
    try {
      const channelName = uuid();
      const callerToken = await this.agoraHelperService.createAgoraCallToken(callerId, channelName);
      const calleeToken = await this.agoraHelperService.createAgoraCallToken(calleeId, channelName);
      await this.sendVOIPNotification(calleeId, calleeToken, callerId, callType, channelName);
      return {
        token: callerToken,
        channelName,
      };
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {string} userId
   * @returns {Promise<{ message: string; userToken: any; expirationTime: any; chatUsername: string; }>\}
   */
  async createAgoraChatUserToken(userId: string) {
    try {
      const user = await this.usersRepository.findById(userId, {
        agoraUuid: 1,
        authProviderId: 1,
      });
      let chatUserUuid = user?.agoraUuid;
      if (!chatUserUuid) {
        chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(userId),
          user?.authProviderId,
        );

        if (!chatUserUuid) return null;
        await this.usersRepository.updateById(userId, {
          agoraUuid: chatUserUuid,
        });
      }
      const token = await this.agoraHelperService.createAgoraChatUserToken(chatUserUuid);
      return {
        message: this.i18nService.t('stripe_subscriptions.token_generated'),
        userToken: token,
        expirationTime: AGORA_USER_TOKEN_EXPIRY,
        chatUsername: String(userId),
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {string} calleeId
   * @param {string} callToken
   * @param {string} callerId
   * @param {string} callType
   * @param {string} channelName
   * @returns {Promise<any>}
   */
  async sendVOIPNotification(
    calleeId: string,
    callToken: string, // agora call token, meetingId for chime
    callerId: string,
    callType: string,
    channelName: string,
  ) {
    try {
      const { firstName, lastName } = await this.usersRepository.findById(callerId, {
        firstName: 1,
        lastName: 1,
      });

      const pushTokens = await this.pushNotificationTokenRepo.find({
        userId: calleeId,
      });

      let response;

      //for ios
      const voipTokens = pushTokens
        .filter((d) => d.voipToken && d.deviceType === DEVICE_TYPE.IOS)
        .map((d) => d.voipToken);

      if (voipTokens.length) {
        response = await this.voipHelperService.sendVoipIos(
          [...new Set<string>(voipTokens)],
          {
            callToken,
            callType,
            callerId,
            callerName: [firstName, lastName].join(' '),
            calleeId,
            channelName,
          },
          CHAT_TYPE,
        );
      }

      // for android
      const FCMTokens = pushTokens
        .filter((d) => d.pushToken && d.deviceType === DEVICE_TYPE.ANDROID)
        .map((d) => d.pushToken);
      response = await this.voipHelperService.sendVoipAndroid(
        [...new Set<string>(FCMTokens)],
        {
          callToken,
          callType,
          callerId,
          callerName: [firstName, lastName].join(' '),
          calleeId,
          channelName,
        },
        CHAT_TYPE,
      );

      return response;
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }
}
