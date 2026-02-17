import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole, ChatTokenBuilder } from 'agora-token';
import { firstValueFrom } from 'rxjs';
import {
  AGORA_APP_TOKEN_EXPIRY,
  AGORA_SERVICE_EXPIRY,
  AGORA_USER_TOKEN_EXPIRY,
} from '@api/constants';
import axios from 'axios';
import * as zlib from 'zlib'; // Built-in Node.js module
import { cat } from '@xenova/transformers';

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

  async createAgoraChatUser(
    appToken: string,
    username: string,
    password: string,
    nickname: string,
  ) {
    const body = {
      username,
      password,
      nickname,
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
      console.log(resp);

      if (resp.status !== 200) {
        return null;
      }
      console.log(resp.data);
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

  async getChatUserUuid(username: string, password: string, nickname: string) {
    try {
      const appToken = await this.createAgoraChatAppToken();

      const chatUser = await this.getAgoraChatUser(appToken, username);
      console.log(chatUser);
      if (chatUser?.entities[0]?.uuid) {
        return chatUser?.entities[0].uuid;
      } else {
        const chatUser = await this.createAgoraChatUser(
          appToken,
          username,
          password,
          nickname,
        );
        return chatUser?.entities[0]?.uuid;
      }
    } catch (error) {
      return null;
    }
  }

  async updateChatUser(username: string, body: IAgoraUserAttribute) {
    try {
      console.log('i m here');
      const appToken = await this.createAgoraChatAppToken();
      console.log(appToken);
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${appToken}`,
      };
      const agoraUser = await this.getAgoraChatUser(appToken, username);
      if (!agoraUser) {
        console.log('agora null');
        return null;
      }
      console.log('agoraUser', agoraUser);

      const resp = await firstValueFrom(
        this.httpService.put(`${this.baseURLChat}/users/${username}`, body, {
          headers,
        }),
      );

      if (resp.status != 200) {
        return null;
      }
      console.log(resp.data);
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

  // async getRestToken() {
  //   try {
  //     const ORG_NAME = process.env.AGORA_CHAT_ORG_NAME;
  //     const APP_NAME = process.env.AGORA_CHAT_APP_NAME;
  //     const CUSTOMER_ID = process.env.AGORA_CHAT_CUSTOMER_ID;
  //     const CUSTOMER_SECRET = process.env.AGORA_CHAT_CUSTOMER_SECRET;
  //     console.log(ORG_NAME, APP_NAME, CUSTOMER_ID, CUSTOMER_SECRET);
  //     const res = await axios.post(
  //       `https://a61.chat.agora.io/${ORG_NAME}/${APP_NAME}/token`,
  //       {
  //         grant_type: 'client_credentials',
  //         client_id: CUSTOMER_ID,
  //         client_secret: CUSTOMER_SECRET,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );
  //     console.log('res from agora restTOken', res);
  //     const accessToken = res.data.access_token;
  //     console.log('Agora REST Token:', accessToken);
  //     return accessToken;
  //   } catch (err) {
  //     console.error(
  //       'Failed to get REST token',
  //       err.response?.data || err.message,
  //     );
  //     if (err.response) {
  //       console.error('Status:', err.response.status);
  //       console.error('Data:', err.response.data);
  //     }
  //     throw err;
  //   }
  // }

  async getGroupList() {
    const appToken = await this.createAgoraChatAppToken();
    console.log(appToken);
    try {
      // const response = await axios.get(`${this.baseURLChat}/chatgroups`, {
      //   headers: {
      //     Authorization: `Bearer ${appToken}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      // const groupList = response.data;
      // console.log(groupList);

      this.fetchGroupHistoryRange();
    } catch (err) {
      console.log(err);
    }
  }
  async fetchGroupHistoryRange() {
    // 1. Generate the hourly strings for the range
    // Yesterday 10 AM (2026021210) to Today 10 AM (2026021310)
    const hours = this.generateHourRange();
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    let allGroupMessages = [];

    // Get your Admin Token (using your existing function)
    const appToken = await this.createAgoraChatAppToken();

    for (const hour of hours) {
      await sleep(10000);
      console.log(`Processing hour: ${hour}...`)
      try {
        // 2. Get the download URL from Agora
        const response = await axios.get(
          `${this.baseURLChat}/chatmessages/${hour}`,
          { headers: { Authorization: `Bearer ${appToken}` } },
        );
        // Extract the actual URL from the response
        const downloadUrl = response.data.data[0].url;
        console.log(downloadUrl);
        // 3. Download the .gz file as a buffer
        const fileBuffer = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
        });
        console.log(fileBuffer.data);
        // 4. Unzip the data
        const unzippedBuffer = zlib.gunzipSync(fileBuffer.data);
        const rawContent = unzippedBuffer.toString('utf-8');

        console.log('rawa contetnt', rawContent);

        // 5. Parse JSON line-by-line and filter by Group ID
        const hourlyMessages = rawContent
          .split('\n')
          .filter((line) => line.trim()) // Remove empty lines
          .map((line) => JSON.parse(line))
          .filter((msg) => msg.chat_type === 'groupchat'); // FILTER  GROUP Chat

        console.log(`Found ${hourlyMessages.length} messages in hour ${hour}`);
        (console.log('hourly Message', hourlyMessages[0].payload.bodies),
          console.log('hourly Message', hourlyMessages[1].payload.bodies));

        allGroupMessages.push(...hourlyMessages);
      } catch (error) {
        // Handle 404 (No messages in that hour)
        if (error.response && error.response.status === 404) {
          console.log(`No messages sent in hour ${hour}. Skipping.`);
        } else {
          console.error(`Error at hour ${hour}:`, error.message);
        }
      }
    }
    return allGroupMessages;
  }

  private generateHourRange(): string[] {
    const hours: string[] = [];

    // 1. Set the Start Time: Yesterday at 10:00 AM (Local Time)
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(10, 0, 0, 0);

    // 2. Set the End Time: Today at 10:00 AM (Local Time)
    const end = new Date();
    end.setHours(10, 0, 0, 0);

    // 3. Loop hour by hour
    let current = new Date(start);
    while (current <= end) {
      // Agora requires UTC time strings
      const utcYear = current.getUTCFullYear();
      const utcMonth = String(current.getUTCMonth() + 1).padStart(2, '0');
      const utcDay = String(current.getUTCDate()).padStart(2, '0');
      const utcHour = String(current.getUTCHours()).padStart(2, '0');

      hours.push(`${utcYear}${utcMonth}${utcDay}${utcHour}`);

      // Move to the next hour
      current.setHours(current.getHours() + 1);
    }

    return hours;
  }
}
