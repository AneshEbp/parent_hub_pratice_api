import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class InitiateAgoraCallInput
 * @typedef {InitiateAgoraCallInput}
 */
@InputType()
export class InitiateAgoraCallInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  calleeId?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  @IsEnum(['audio', 'video'])
  callType?: string;
}
