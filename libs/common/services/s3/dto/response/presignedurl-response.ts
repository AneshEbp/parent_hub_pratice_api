import { MessageResponse } from '@app/common/dto/response/message.response';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class PreSignedUrlResponse
 * @typedef {PreSignedUrlResponse}
 */
@ObjectType()
export class PreSignedUrlResponse extends MessageResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  url?: string;

  @Field(() => [String], { nullable: true })
  urls: string[];
}

@ObjectType()
export class GetUploadUrlFromKeyResponse {
  @Field()
  url: string;
}

@ObjectType()
export class UploadUrlResponse {
  @Field()
  key: string;

  @Field()
  uploadUrl: string;

  @Field()
  fetchUrl: string;
}
