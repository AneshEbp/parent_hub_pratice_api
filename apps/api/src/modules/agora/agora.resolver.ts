import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AgoraService } from './agora.service';
import {
  AgoraCallTokenResponse,
  AgoraChatUserTokenResponse,
  AgoraTokenResponse,
} from './dto/response/agora-token.response';
import { UseGuards } from '@nestjs/common';
import { AuthUserGuard } from '@api/guards/auth.user.guard';
import { LoginDetail } from '../auth/decorator/login.decorator';
import { LoginDetailType } from '../auth/types/login-detail.type';
import { InitiateAgoraCallInput } from './dto/input/agora-call.input';
import { TermsGuard } from '@api/guards/terms.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ChatHistoryInput } from './dto/input/chatHistory.input';
import { ChatHistoryResponse } from './dto/response/chatHistory.response';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AgoraResolver
 * @typedef {AgoraResolver}
 */
@Resolver(() => AgoraTokenResponse)
export class AgoraResolver {
  /**
   * Creates an instance of AgoraResolver.
   *
   * @constructor
   * @param {AgoraService} agoraService
   */
  constructor(private readonly agoraService: AgoraService) {}

  /**
   * Creates an Agora token for .
   *
   * @returns {Promise<AgoraTokenResponse>} - A promise that resolves to an AgoraTokenResponse object containing the generated token, channel name, and uid.
   */
  @UseGuards(AuthUserGuard)
  @Mutation(() => AgoraTokenResponse)
  async getAgoraToken(
    @LoginDetail() { userId }: LoginDetailType,
    @I18n() i18n: I18nContext,
  ): Promise<AgoraTokenResponse> {
    const { token, channelName, userAccount } =
      await this.agoraService.createAgoraToken(userId);
    return {
      message: i18n.t('agora.token_generated'),
      token,
      channelName,
      userAccount,
    };
  }

  /**
   * Creates an Agora token for .
   *
   * @returns {Promise<AgoraCallTokenResponse>} - A promise that resolves to an AgoraCallTokenResponse object containing the generated token, channel name, and uid.
   */
  @UseGuards(AuthUserGuard)
  @Mutation(() => AgoraCallTokenResponse)
  async initiateAgoraCall(
    @Args('body') body: InitiateAgoraCallInput,
    @LoginDetail() { userId }: LoginDetailType,
    @I18n() i18n: I18nContext,
  ): Promise<AgoraCallTokenResponse> {
    const { calleeId, callType } = body;
    const { token, channelName } = await this.agoraService.initiateAgoraCall(
      userId,
      calleeId,
      callType,
    );
    return {
      message: i18n.t('agora.call_initiated'),
      token,
      channelName,
      callerId: String(userId),
      calleeId,
    };
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {LoginDetailType} param0
   * @param {string} param0.userId
   * @returns {Promise<AgoraChatUserTokenResponse>}
   */
  @UseGuards(AuthUserGuard)
  @Mutation(() => AgoraChatUserTokenResponse, { nullable: true })
  async createAgoraChatUserToken(
    @LoginDetail() { userId }: LoginDetailType,
  ): Promise<AgoraChatUserTokenResponse> {
    console.log('apihit');
    console.log(userId);
    const result = await this.agoraService.createAgoraChatUserToken(userId);
    console.log('agora chat token result', result);
    return result;
  }

  @Mutation(() => String)
  async archiveChatHistory() {
    const result = await this.agoraService.archiveChatHistory();
    return result;
  }

  @UseGuards(AuthUserGuard)
  @Query(() => ChatHistoryResponse)
  async getChatHistoryByDate(
    @Args('input', { type: () => ChatHistoryInput }) input: ChatHistoryInput,
    @LoginDetail() {userId}: LoginDetailType,
  ) {
    const messages = await this.agoraService.getChatHistoryByDate(userId, input);
    return { messages };
  }
}
