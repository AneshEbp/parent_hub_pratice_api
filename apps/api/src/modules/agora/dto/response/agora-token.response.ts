import { MessageResponse } from '@app/common/dto/response/message.response';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AgoraTokenResponse
 * @typedef {AgoraTokenResponse}
 * @extends {MessageResponse}
 */
@ObjectType()
export class AgoraTokenResponse extends MessageResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  token?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  channelName?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  userAccount?: string;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AgoraCallTokenResponse
 * @typedef {AgoraCallTokenResponse}
 * @extends {MessageResponse}
 */
@ObjectType()
export class AgoraCallTokenResponse extends MessageResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  token?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  channelName?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  callerId?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  calleeId?: string;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AgoraChatUserTokenResponse
 * @typedef {AgoraChatUserTokenResponse}
 * @extends {MessageResponse}
 */
@ObjectType()
export class AgoraChatUserTokenResponse extends MessageResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  userToken?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  @Field({ nullable: true, description: "Token's expiration time in seconds" })
  expirationTime?: number;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  chatUsername?: string;
}
