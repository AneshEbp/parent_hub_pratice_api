import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole, ChatTokenBuilder } from 'agora-token';
import { firstValueFrom } from 'rxjs';
import {
  AGORA_APP_TOKEN_EXPIRY,
  AGORA_SERVICE_EXPIRY,
  AGORA_USER_TOKEN_EXPIRY,
} from '@api/constants';

export interface IAgoraUserAttribute {
  nickname?: string;
  avatarurl?: string;
  phone?: string;
  mail?: string;
  gender?: string;
}

@Injectable()
export class AgoraHelperService {
  private readonly appId: string;
  private readonly appCertificate: string;
  private readonly baseURLChat: string;
  constructor(private readonly httpService: HttpService) {
    this.appId = process.env.AGORA_APP_ID;
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;
    this.baseURLChat = `https://${process.env.AGORA_CHAT_HOST}/${process.env.AGORA_CHAT_ORG_NAME}/${process.env.AGORA_CHAT_APP_NAME}`;
  }

  async createAgoraCallToken(userId: string, channelName: string) {
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = AGORA_SERVICE_EXPIRY;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    if (!this.appId || !this.appCertificate) {
      throw new BadRequestException(
        'Need to set environment variable AGORA_APP_ID and AGORA_APP_CERTIFICATE',
      );
    }
    // Build token with uid
    // const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(
    //   appId,
    //   appCertificate,
    //   channelName,
    //   uid,
    //   role,
    //   expirationTimeInSeconds,
    //   privilegeExpiredTs,
    // );
    // console.log('Token With Integer Number Uid:', tokenWithUid);

    // Build token with user account
    const tokenWithAccount = RtcTokenBuilder.buildTokenWithUserAccount(
      this.appId,
      this.appCertificate,
      channelName,
      String(userId),
      role,
      expirationTimeInSeconds,
      privilegeExpiredTs,
    );
    return tokenWithAccount;
  }

  async createAgoraChatAppToken() {
    const appPrivilegeExpiredTs = AGORA_APP_TOKEN_EXPIRY;
    const appToken = ChatTokenBuilder.buildAppToken(
      this.appId,
      this.appCertificate,
      appPrivilegeExpiredTs,
    );
    return appToken;
  }

  async createAgoraChatUserToken(userUuid: string) {
    const userToken = ChatTokenBuilder.buildUserToken(
      this.appId,
      this.appCertificate,
      userUuid,
      AGORA_USER_TOKEN_EXPIRY,
    );
    return userToken;
  }

  async createAgoraChatUser(appToken: string, username: string, password: string) {
    const body = {
      username,
      password,
      nickname: username,
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${appToken}`,
    };
    const resp = await firstValueFrom(
      this.httpService.post(`${this.baseURLChat}/users`, body, {
        headers,
      }),
    );

    if (resp.status !== 200) {
      return null;
    }

    return resp?.data;
  }

  async getAgoraChatUser(appToken: string, username: string) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appToken}`,
      };
      const resp = await firstValueFrom(
        this.httpService.get(`${this.baseURLChat}/users/${username}`, {
          headers,
        }),
      );

      if (resp.status !== 200) {
        return null;
      }

      return resp?.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * @description get uuid of agora user, create one if doesnot exist
   * @param {string} username agora username - user account id
   * @param {string} password agora user password - authproviderId used for password to make it unique for each user
   * @returns
   */

  async getChatUserUuid(username: string, password: string) {
    try {
      const appToken = await this.createAgoraChatAppToken();

      const chatUser = await this.getAgoraChatUser(appToken, username);
      if (chatUser?.entities[0]?.uuid) {
        return chatUser?.entities[0].uuid;
      } else {
        const chatUser = await this.createAgoraChatUser(appToken, username, password);
        return chatUser?.entities[0]?.uuid;
      }
    } catch (error) {
      return null;
    }
  }

  async updateChatUser(username: string, body: IAgoraUserAttribute) {
    try {
      const appToken = await this.createAgoraChatAppToken();
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${appToken}`,
      };
      const agoraUser = await this.getAgoraChatUser(appToken, username);
      if (!agoraUser) {
        return null;
      }

      const resp = await firstValueFrom(
        this.httpService.put(`${this.baseURLChat}/users/${username}`, body, {
          headers,
        }),
      );

      if (resp.status != 200) {
        return null;
      }
      return resp?.data;
    } catch (error) {
      console.log(error, 'Error updating agora user');
      return null;
    }
  }

  // async deleteAgoraChatUser(appToken: string, uid: string) {
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${appToken}`,
  //   };
  //   const resp = await firstValueFrom(
  //     this.httpService.delete(`${this.baseURLUsers}/${uid}`, {
  //       headers,
  //     }),
  //   );
  //   if (resp.status != 200) {
  //     return null;
  //   }
  //   return resp?.data;
  // }
}
