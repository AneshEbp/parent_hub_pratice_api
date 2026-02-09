import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { BadRequestException, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthUserGuard } from '../../guards/auth.user.guard';
import { AuthService } from './services/auth.service';
import { DeviceInfoInput } from './dto/input/device-info.input';
import { LoginDetail } from './decorator/login.decorator';
import { LoginDetailType } from './types/login-detail.type';
import { LoginWithAppleResponse } from './dto/response/login.with.apple.response';
import { AppleLoginInput } from './dto/input/apple-login.input';
import { OTPResponse } from './dto/response/otp.response';
import { LoginResponse } from './dto/response/login.response';
import { LoginWithGoogleResponse } from './dto/response/login.with.google.response';
import { GoogleLoginInput } from './dto/input/google-login.input';
import { LoginWithFacebookResponse } from './dto/response/login.with.facebook.response';
import { FacebookLoginInput } from './dto/input/facebook-login.input';
import { RequestLoginOTPInput } from './dto/input/reqest-login-otp.input';
import { LoginWithOTPInput } from './dto/input/login-with-otp.input';
import { EmailSignupOTPInput } from './dto/input/email-signup-otp.input';
import { LoginWithEmailResponse } from './dto/response/login.with.email.response';
import { SignupInput } from './dto/input/signup.input';
import { VerifyEmailResponse } from './dto/response/verify.email.response';
import { VerifyEmailInput } from './dto/input/verify-email.input';
import { SetPasswordGuard } from '@api/guards/set.password.guard';
import { SetPasswordInput } from './dto/input/set-pawwrod.input';
import { LoginEmailPasswordInput } from './dto/input/login-email-password.input';
import { ChangePasswordInput } from './dto/input/change-password.input';
import { ForgotPasswordResponse } from './dto/response/forgot.password.response';
import { ForgotPasswordInput } from './dto/input/forgot-password.input';
import { VerifyResetPasswordOtpInput } from './dto/input/verify-reset-password-otp.input';
import { ResetPasswordInput } from './dto/input/reset-password.input';
import { Token } from '../../common/dto/token';
import { RegisterResponse } from './dto/response/register.response';
import { RequestedFor } from '@app/common/enum/otp-request.enum';
import { SocialLoginResponse } from './dto/response/login.with.social.response';
import { TiktokLoginInput } from './dto/input/tiktok-login-input';
import { BiometricEnableInput } from './dto/input/biometric.enable.input';
import { BiometricEnableResponse } from './dto/response/biometric.enable.response';
import { BiometricLoginResponse } from './dto/response/login.with.biometric.response';
import { MessageResponse } from '@app/common/dto/response/message.response';
import { BiometricLoginInput } from './dto/input/biometric.login.input';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SkipTermsAcceptanceCheck } from './decorator/terms.decorator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AuthResolver
 * @typedef {AuthResolver}
 */
@Resolver()
export class AuthResolver {
  /**
   * Creates an instance of AuthResolver.
   *
   * @constructor
   * @param {AuthService} authService
   * @param {PhoneOtpAuthService} phoneOtpAuthService
   */
  constructor(
    private readonly authService: AuthService,
  ) {}

  /**
   * Save device information such as device name
   * @param loginDetail
   * @param args
   * @returns
   */
  @Mutation(() => MessageResponse)
  @UseGuards(AuthUserGuard)
  async saveDeviceInfo(
    @LoginDetail() loginDetail: LoginDetailType,
    @Args('body') body: DeviceInfoInput,
    @I18n() i18n: I18nContext,
  ) {
    await this.authService.saveDeviceInfo({
      ...body,
      userId: loginDetail.userId,
      jti: loginDetail.jti,
    });
    return { message: i18n.t('auth.device_info_added') };
  }

  /**
   * Logout from current device
   * @param loginDetail
   * @returns
   */
  @Mutation(() => MessageResponse)
  @UseGuards(AuthUserGuard)
  async logout(@LoginDetail() loginDetail: LoginDetailType, @I18n() i18n: I18nContext) {
    await this.authService.logout(loginDetail.jti);
    return { message: i18n.t('auth.log_out_successfully') };
  }

  /**
   * Logout from all device
   * @param loginDetail
   * @returns
   */
  @Mutation(() => MessageResponse)
  @UseGuards(AuthUserGuard)
  async logoutAll(@LoginDetail() loginDetail: LoginDetailType, @I18n() i18n: I18nContext) {
    await this.authService.logoutAll(loginDetail.userId);
    return { message: i18n.t('auth.log_out_successfully') };
  }

  /**
   * Login with Apple
   * @param {AppleLoginInput} args apple login input
   * @returns
   */
  @Mutation(() => LoginWithAppleResponse)
  async loginWithApple(
    @Args() args: AppleLoginInput,
    @I18n() i18n: I18nContext,
  ): Promise<LoginWithAppleResponse> {
    try {
      const loginDetail = await this.authService.loginWithApple(args);
      return { message: i18n.t('auth.login_successfully'), ...loginDetail };
    } catch (e) {
      throw new HttpException(i18n.t('auth.fail_to_authorize_apple'), HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Login with Google
   *
   * @async
   * @param {GoogleLoginInput} args
   * @returns {Promise<LoginWithGoogleResponse>}
   */
  @Mutation(() => LoginWithGoogleResponse)
  async loginWithGoogle(
    @Args() args: GoogleLoginInput,
    @I18n() i18n: I18nContext,
  ): Promise<LoginWithGoogleResponse> {
    const loginDetail = await this.authService.loginWithGoogle(args);
    return { message: i18n.t('auth.login_successfully'), ...loginDetail };
  }

  /**
   * Login via facebook access token
   * @param body
   * @returns
   */
  @Mutation(() => LoginWithFacebookResponse)
  async loginWithFacebook(
    @Args() args: FacebookLoginInput,
    @I18n() i18n: I18nContext,
  ): Promise<LoginWithFacebookResponse> {
    try {
      const loginDetail = await this.authService.loginWithFacebook(args);
      return { message: i18n.t('auth.login_successfully'), ...loginDetail };
    } catch (e) {
      throw new HttpException(i18n.t('auth.failed_to_authorize_facebook'), HttpStatus.BAD_REQUEST);
    }
  }


  /**
   * Mutation to send opt for email login
   * @param body
   * @returns
   */
  @Mutation(() => OTPResponse)
  async requestLoginOTP(
    @Args('body') body: RequestLoginOTPInput,
    @I18n() i18n: I18nContext,
  ): Promise<OTPResponse> {
    const otpResp = await this.authService.sendEmailOTP(body, RequestedFor.app_login);
    const { message, ...expiry } = otpResp;
    return {
      message: otpResp.message || i18n.t('auth.verification_code_sent_to_email'),
      expiry: { ...expiry },
    };
  }

  /**
   * Mutation to login via OTP
   * @param body
   * @returns
   */
  @Mutation(() => LoginResponse)
  async loginWithOTP(
    @Args('body') body: LoginWithOTPInput,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    const loginDetail = await this.authService.loginWithOTP(body);
    return { message: i18n.t('auth.login_successfully'), ...loginDetail };
  }

  /**
   * Send otp for email login
   * @param body
   * @returns
   */
  @Mutation(() => OTPResponse)
  async registerWithEmail(
    @Args('body') body: EmailSignupOTPInput,
    @I18n() i18n: I18nContext,
  ): Promise<OTPResponse> {
    try {
      const registerInput: EmailSignupOTPInput = body;
      const otpResp = await this.authService.registerWithEmail(registerInput);
      return {
        message: i18n.t('auth.verification_code_sent_to_email'),
        expiry: { ...otpResp },
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * User registration
   *
   * @async
   * @param {SignupInput} body
   * @returns {Promise<RegisterResponse>}
   */
  @Mutation(() => RegisterResponse)
  async registerUser(@Args('body') body: SignupInput): Promise<RegisterResponse> {
    return this.authService.registerUser({
      ...body,
    });
  }

  /**
   * resending Otp via email
   *
   * @async
   * @param {EmailSignupOTPInput} body
   * @returns {Promise<OTPResponse>}
   */
  @Mutation(() => OTPResponse)
  async resendVerifyEmailOtp(@Args('body') body: EmailSignupOTPInput): Promise<OTPResponse> {
    const { deviceId, email } = body;
    return this.authService.resendVerifyEmailOtp(email, deviceId);
  }

  /**
   * Mutation to verify email
   * @param body
   * @returns
   */
  @Mutation(() => VerifyEmailResponse)
  async verifyEmail(
    @Args('body') body: VerifyEmailInput,
    @I18n() i18n: I18nContext,
  ): Promise<VerifyEmailResponse> {
    const verifyInput = body;
    const loginDetail = await this.authService.verifyEmailAndLogin(verifyInput);
    return { message: i18n.t('auth.login_successfully'), ...loginDetail };
  }

  /**
   * Set password
   *
   * @async
   * @param {LoginDetailType} loginDetail
   * @param {SetPasswordInput} args
   * @param {I18nContext} i18n
   * @returns {unknown}
   */
  @Mutation(() => MessageResponse)
  @UseGuards(SetPasswordGuard)
  async setPassword(
    @LoginDetail() loginDetail: LoginDetailType,
    @Args() args: SetPasswordInput,
    @I18n() i18n: I18nContext,
  ) {
    await this.authService.setPasswordUpdateGrant(
      loginDetail.userId,
      args?.password,
      loginDetail.jti,
    );
    return { message: i18n.t('auth.password_set_successfully') };
  }

  /**
   * Login with email and password
   *
   * @async
   * @param {LoginEmailPasswordInput} body
   * @returns {Promise<{ message: any; user: any; expiry: { expiresBy: number; expiresAt: any; }; token?: undefined; \} | { user: any; token: any; message: any; expiry?: undefined; \}>\}
   */
  @Mutation(() => LoginWithEmailResponse)
  async loginWithEmailPassword(
    @Args('body') body: LoginEmailPasswordInput,
    @I18n() i18n: I18nContext,
    @Context('req') req: Request,
  ) {
    const ip = req.headers['x-forwarded-for'] || '';
    const agent = req.headers['user-agent'];
    console.log({...body})
    const loginDetail = await this.authService.loginWithEmail({ ...body, ip, agent });
    return { message: i18n.t('auth.login_successfully'), ...loginDetail };
  }

  /**
   * Change password api
   * @param user
   * @param body
   * @returns
   */
  @UseGuards(AuthUserGuard)
  @Mutation(() => MessageResponse)
  async changePassword(
    @LoginDetail() loginDetail,
    @Args('body') body: ChangePasswordInput,
    @I18n() i18n: I18nContext,
  ) {
    const { password, new_password } = body;
    try {
      if (password.toLocaleLowerCase() === new_password.toLocaleLowerCase()) {
        throw new BadRequestException(i18n.t('auth.cannot_update_same_password'));
      }
      await this.authService.verifyPassword(loginDetail.userId, password);
      await this.authService.updateUserPasswordById(loginDetail.userId, new_password);
      return { message: i18n.t('auth.password_changed_successfully') };
    } catch (error: any) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   *
   * @param body Forget password api
   * An email with otp will be sent to the users email
   * @returns
   */
  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(@Args('body') body: ForgotPasswordInput, @I18n() i18n: I18nContext) {
    const otpResp = await this.authService.forgotPassword(body);
    return {
      message: i18n.t('auth.password_reset_code_sent'),
      expiry: { ...otpResp },
    };
  }

  /**
   *
   * @param body Reset password api
   * User can reset their password with otp code
   * @returns
   */
  @Mutation(() => MessageResponse)
  async verifyResetPasswordOTP(
    @Args('body') body: VerifyResetPasswordOtpInput,
    @I18n() i18n: I18nContext,
  ) {
    const { email, verificationCode } = body;
    const isValidVerificationCode = await this.authService.verifyResetPasswordCode(
      email,
      verificationCode,
    );
    if (!isValidVerificationCode) {
      throw new BadRequestException(i18n.t('auth.invalid_verification_code'));
    }

    return { message: i18n.t('auth.verification_code_valid_set_password') };
  }
  /**
   *
   * @param body Reset password api
   * User can reset their password with otp code
   * @returns
   */
  @Mutation(() => MessageResponse)
  async resetPassword(@Args('body') body: ResetPasswordInput, @I18n() i18n: I18nContext) {
    const { email, password, verificationCode } = body;
    await this.authService.resetPassword(email, password, verificationCode);
    return { message: i18n.t('auth.password_set_successfully') };
  }

  /**
   * Get new tokens
   * @param refreshToken
   * @returns
   */
  @Mutation(() => Token)
  async refresh(@Args('refreshToken') refreshToken: string): Promise<Token> {
    const tokenDetail = await this.authService.refresh(refreshToken);
    return tokenDetail;
  }

  /**
   * Mutation to login via tiktok access token
   * @param args
   * @returns
   */
  @Mutation(() => SocialLoginResponse)
  async LoginWithTiktok(
    @Args() args: TiktokLoginInput,
    @I18n() i18n: I18nContext,
  ): Promise<SocialLoginResponse> {
    try {
      const loginDetail = await this.authService.loginWithTiktok(args);
      return { message: i18n.t('auth.login_successfully'), ...loginDetail };
    } catch (e) {
      throw new HttpException(i18n.t('auth.failed_to_authorize_tiktok'), HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Mutation to enable biometric authentication
   * @param body
   * @returns
   */
  @UseGuards(AuthUserGuard)
  @Mutation(() => BiometricEnableResponse)
  async enableBiometricAuth(
    @LoginDetail() loginDetail: LoginDetailType,
    @Args() body: BiometricEnableInput,
    @I18n() i18n: I18nContext,
  ) {
    const { deviceId } = body;
    const biometricTokenDetails = await this.authService.enableBiometricAuth(loginDetail, deviceId);
    return {
      ...biometricTokenDetails.token,
      message: i18n.t('auth.biometric_enable_success'),
    };
  }

  /**
   * Login with biometric
   *
   * @async
   * @param {BiometricLoginInput} body
   * @returns {Promise<any>}
   */
  @Mutation(() => BiometricLoginResponse)
  async loginWithBiometric(@Args('body') body: BiometricLoginInput): Promise<{
    biometricToken: string;
    biometricTokenExpiresIn: Date;
    accessToken: string;
    accessTokenExpiresIn: Date;
    refreshToken: string;
    refreshTokenExpiresIn: Date;
  }> {
    const { deviceId, biometricToken } = body;
    const biometricLoginDetail = await this.authService.loginWithBiometric(
      biometricToken,
      deviceId,
    );
    return {
      ...biometricLoginDetail,
    };
  }

  @SkipTermsAcceptanceCheck()
  @Query(() => String)
  getCsrfToken(@Context('req') req): string {
    return req.csrfToken(); // Returns the CSRF token
  }
}
