import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UpdateUserEmailDto
 * @typedef {UpdateUserEmailDto}
 */
@InputType()
export class UpdateUserEmailDto {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsEmail()
  email: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  deviceId: string;
}
