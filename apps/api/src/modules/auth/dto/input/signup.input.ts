import { Field, InputType } from '@nestjs/graphql';
import { EmailSignupOTPInput } from './email-signup-otp.input';
import { IsOptional, Length, Matches, ValidateNested } from 'class-validator';
import { LoginFlowType } from '@app/common/enum/login-flow-type.enum';
import { UpdatePhoneNumberInput } from './update-phone-number.input';
import { Transform, Type } from 'class-transformer';
import { PASSWORD_REGEX_CHOICE_1 } from 'apps/api/src/constants';


/**
 * ${1:Description placeholder}
 *
 * @export
 * @class SignupInput
 * @typedef {SignupInput}
 * @extends {EmailSignupOTPInput}
 */
@InputType()
export class SignupInput extends EmailSignupOTPInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  @IsOptional()
  @Length(2, 80)
  @Transform(({ value }) => (value || '').trim())
  firstName: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  @IsOptional()
  @Length(2, 80)
  @Transform(({ value }) => (value || '').trim())
  lastName: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  @Transform(({ value }) => (value || '').trim())
  @Matches(PASSWORD_REGEX_CHOICE_1.regex, {
    message: PASSWORD_REGEX_CHOICE_1.message,
  })
  password: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?UpdatePhoneNumberInput}
   */
  @Field({ nullable: true })
  @ValidateNested()
  @Type(() => UpdatePhoneNumberInput)
  phoneNumber?: UpdatePhoneNumberInput;

  /**
   * ${1:Description placeholder}
   *
   * @type {?LoginFlowType}
   */

  @Field(() => LoginFlowType, {
    nullable: true,
    defaultValue: LoginFlowType.otp,
  })
  @IsOptional()
  loginFlowType?: LoginFlowType;
}
