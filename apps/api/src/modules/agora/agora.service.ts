import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  PushNotificationTokenRepository,
  UsersRepository,
} from '@app/data-access';
import { AGORA_USER_TOKEN_EXPIRY } from '@api/constants';
import { CHANNEL_NAME, CHAT_TYPE, DEVICE_TYPE } from './constants';
import { I18nService } from 'nestjs-i18n';
import { VoipHelperService } from '@app/common/services/voip/agora/agora';
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';
import {
  prepareArchive,
  streamAndAppend,
} from '@app/common/helpers/file.helper';
import { ChatHistoryInput } from './dto/input/chatHistory.input';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { IConversationRepository } from '@app/data-access/conversation-index/iconversation.repository';

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
    private readonly conversationRepository: IConversationRepository,
  ) {}

  private archiveDir = path.join(process.cwd(), 'archive');

  /**
   * @description Create an Agora Token for audio/video call
   * @param userId user id
   * @returns token, channel name and user account id
   */

  async createAgoraToken(userId: string) {
    try {
      const channelName = CHANNEL_NAME; // use dynamic channel name later

      const tokenWithAccount =
        await this.agoraHelperService.createAgoraCallToken(userId, channelName);
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
  async initiateAgoraCall(
    callerId: string,
    calleeId: string,
    callType: string,
  ) {
    try {
      const channelName = uuid();
      const callerToken = await this.agoraHelperService.createAgoraCallToken(
        callerId,
        channelName,
      );
      const calleeToken = await this.agoraHelperService.createAgoraCallToken(
        calleeId,
        channelName,
      );
      await this.sendVOIPNotification(
        calleeId,
        calleeToken,
        callerId,
        callType,
        channelName,
      );
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
      console.log(user);
      let chatUserUuid = user?.agoraUuid;
      if (!chatUserUuid) {
        chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(userId),
          user?.authProviderId,
          user.firstName,
        );

        if (!chatUserUuid) return null;
        await this.usersRepository.updateById(userId, {
          agoraUuid: chatUserUuid,
        });
      }
      const token =
        await this.agoraHelperService.createAgoraChatUserToken(chatUserUuid);
      console.log(token);
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
      const { firstName, lastName } = await this.usersRepository.findById(
        callerId,
        {
          firstName: 1,
          lastName: 1,
        },
      );

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

  // 🔹 Generate past 24 hours in Singapore time (UTC+8)
  private generatePast24HourRange(): string[] {
    const hours: string[] = [];

    // Current time in Singapore
    const sgtNow = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Singapore',
    });
    const sgtDate = new Date(sgtNow);

    // Round to start of current hour
    sgtDate.setMinutes(0, 0, 0);

    // Loop past 24 hours
    for (let i = 23; i >= 0; i--) {
      const hourDate = new Date(sgtDate.getTime() - i * 60 * 60 * 1000);

      const year = hourDate.getFullYear();
      const month = String(hourDate.getMonth() + 1).padStart(2, '0');
      const day = String(hourDate.getDate()).padStart(2, '0');
      const hour = String(hourDate.getHours()).padStart(2, '0');

      hours.push(`${year}${month}${day}${hour}`);
    }

    return hours;
  }

  async archiveChatHistory() {
    try {
      const hours = [
        // '2026021504',
        // '2026021205',
        // '2026021206',
        // '2026021207',
        // '2026021208',
        '2026021908',
        // '2026021210',
        // '2026021211',
        // '2026021212',
      ];
      // const hours = this.generatePast24HourRange();
      await this.archiveDailyChat(hours);
      return 'History archived succesffuly';
    } catch (err) {
      return `error while saving chathistory: ${err.message}`;
    }
  }

  // 🔹 Utility Sleep
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 🔹 Save chat history
  public async archiveDailyChat(hours: string[]): Promise<void> {
    const appToken = await this.agoraHelperService.createAgoraChatAppToken();
    const { writeStream, filePath, today } = prepareArchive();
    // Extract just '2026-02-19.ndjson' from the full path
    const fileNameOnly = path.basename(filePath);
    const archiveDate = new Date(today);
    try {
      for (const hour of hours) {
        console.log(`Processing hour: ${hour}`);
        // await this.sleep(10000);

        try {
          const downloadUrl = await this.agoraHelperService.getDownloadUrl(
            hour,
            appToken,
          );

          if (!downloadUrl) continue;

          await streamAndAppend(
            downloadUrl,
            writeStream,
            fileNameOnly,
            archiveDate.toString(),
            this.conversationRepository,
          );

          console.log(`✅ Appended hour ${hour}`);
        } catch (error) {
          console.error(`Error processing hour ${hour}:`, error.message);
        }
      }
    } finally {
      writeStream.end();
      console.log(`🎉 Archive completed: ${filePath}`);
    }
  }

  async getChatHistoryByDate(userId: string, body: ChatHistoryInput) {
    const { date, targetUserId } = body;
    userId = userId.toString();

    // File format: 2026-02-18.ndjson
    const filePath = path.join(this.archiveDir, `${date}.ndjson`);

    if (!fs.existsSync(filePath)) {
      console.log('i m here');
      return [];
    }

    const messages: any[] = [];

    // Stream file line-by-line (efficient for large files)
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;

      const chat = JSON.parse(line);

      let isMatch = false;

      if (chat.type === 'groupchat') {
        // In group chats, the "to" field is the Group ID.
        // We check if the targetUserId matches that Group ID.
        isMatch = chat.to === targetUserId;
      } else {
        // Standard one-to-one logic
        isMatch =
          (chat.from === userId && chat.to === targetUserId) ||
          (chat.from === targetUserId && chat.to === userId);
      }

      if (isMatch) {
        messages.push({
          id: chat.id,
          from: chat.from,
          to: chat.to,
          body: chat.msg,
          type: chat.type,
          time: chat.ts,
        });
      }
    }

    // Sort chronologically
    messages.sort((a, b) => a.time - b.time);
    return messages;
  }

  // inside agora.service.ts
  async getChatFileMap(userA: string, userB: string, type: string) {
    // Always sort to match the stored "anesh_hari" format

    const convId =
      type === 'groupchat' ? `group_${userB}` : [userA, userB].sort().join('_');

    const files = await this.conversationRepository.findFilesForChat(convId);
    console.log(files);
    return {
      conversationId: convId,
      totalDaysActive: files.length,
      files: files.map((f) => ({
        name: f.fileName,
        date: new Date(f.date).toISOString().split('T')[0],
      })),
    };
  }
}
