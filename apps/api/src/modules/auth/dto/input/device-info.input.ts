import { Field, InputType } from '@nestjs/graphql';
import { IsIn, IsNotEmpty } from 'class-validator';
/**
 * ${1:Description placeholder}
 *
 * @typedef {deviceType}
 */
type deviceType = 'android' | 'ios';

export enum DeviceTypeEnum {
  ANDROID = 'android',
  IOS = 'ios',
}
/**
 * ${1:Description placeholder}
 *
 * @export
 * @class DeviceInfoInput
 * @typedef {DeviceInfoInput}
 */
@InputType()
export class DeviceInfoInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {deviceType}
   */
  @Field()
  @IsIn([DeviceTypeEnum.ANDROID, DeviceTypeEnum.IOS])
  deviceType: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  @IsNotEmpty()
  deviceName: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  pushNotificationToken: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  voipToken: string;
}
