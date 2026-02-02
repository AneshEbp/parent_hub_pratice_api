import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  UserTokenMetaRepository,
  DeviceInfoRepository,
  PushNotificationTokenRepository,
  UsersRepository,
  UserTokenMeta,
  OTPRequestRepository,
  PhoneContactType,
  LoginInfoRepository,
} from '@app/data-access';

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { JwtTokenService } from '@app/authentication';
import { SocialAuthService } from '@app/social-auth';
import { SocialAuthProvider } from '@app/social-auth/interfaces/social-auth.types';

import { SaveDeviceInfoType } from '../types/save-device-info.type';
import { AppleLoginInput } from '../dto/input/apple-login.input';
import { GoogleLoginInput } from '../dto/input/google-login.input';
import { FacebookLoginInput } from '../dto/input/facebook-login.input';
import { RequestLoginOTPInput } from '../dto/input/reqest-login-otp.input';
import { LoginWithOTPInput } from '../dto/input/login-with-otp.input';
import { EmailSignupOTPInput } from '../dto/input/email-signup-otp.input';
import { SignupInput } from '../dto/input/signup.input';
import { LoginEmailPasswordInput } from '../dto/input/login-email-password.input';
import { ForgotPasswordInput } from '../dto/input/forgot-password.input';
import { JwtService } from '@nestjs/jwt';
import { OTPResponse } from '../dto/response/otp.response';
import { AuthProviderType } from '../enum/auth-provider.enum';
import { TiktokLoginInput } from '../dto/input/tiktok-login-input';
import { LoginDetailType } from '../types/login-detail.type';
import {
  MAX_ATTEMPTS_FROM_DEVICE,
  MULTIPLY_BRFORE_MS,
  SMS_CODE_EXPIRE_BY,
  SMS_CODE_EXPIRE_MULTIPLIER,
} from '../../../constants';

// import { HashHelper, SALT_ROUNDS } from '@app/common/helpers/hash.helper';
import { EmailService } from '@app/email/email.service';
import { I18nService } from 'nestjs-i18n';
import { UserStatus } from '@app/common/enum/user-status.enum';
import { generateSMSCode } from '@app/common/helpers/genericFunction';
import { RequestedFor } from '@app/common/enum/otp-request.enum';
import { HashHelper, SALT_ROUNDS } from '@app/common/helpers/hash.helper';
import { LoginFlowType } from '@app/common/enum/login-flow-type.enum';
import { decodeJwtToken } from '@app/common/helpers/jwt-helper';
import {
  ConfigBiometricVariableService,
  ConfigVariableService,
} from 'apps/api/src/common/helpers/config-helper';
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AuthService
 * @typedef {AuthService}
 */
@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService.
   *
   * @constructor
   * @param {JwtTokenService} jwtTokenService
   * @param {JwtService} jwt
   * @param {SocialAuthService} socialAuthService
   * @param {UserTokenMetaRepository} userTokenMetaRepository
   * @param {DeviceInfoRepository} deviceInfoRepository
   * @param {PushNotificationTokenRepository} pushNotificationTokenRepository
   * @param {UsersRepository} userRepository
   * @param {OTPRequestRepository} otpRequestRepository
   * @param {EmailService} emailService
   * @param {CometChatHelperService} cometChatHelperService
   * @param {AgoraHelperService} agoraHelperService
   */
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly jwt: JwtService,
    private readonly socialAuthService: SocialAuthService,
    private readonly userTokenMetaRepository: UserTokenMetaRepository,
    private readonly deviceInfoRepository: DeviceInfoRepository,
    private readonly loginInfoRepository: LoginInfoRepository,
    private readonly pushNotificationTokenRepository: PushNotificationTokenRepository,
    private readonly userRepository: UsersRepository,
    private readonly otpRequestRepository: OTPRequestRepository,
    private readonly agoraHelperService: AgoraHelperService,
    private readonly emailService: EmailService,
    private readonly i18nService: I18nService,
  ) {}

  /**
   * @description save device info
   * @param {SaveDeviceInfoType} saveDeviceInfo save device info data
   */
  async saveDeviceInfo(saveDeviceInfo: SaveDeviceInfoType) {
    const {
      deviceType,
      deviceName,
      pushNotificationToken,
      voipToken,
      userId,
      jti,
    } = saveDeviceInfo;
    try {
      const getDeviceId = await this.userTokenMetaRepository.findOne({
        userId,
        jti,
      });
      const deviceId = getDeviceId?.deviceId;
      await this.deviceInfoRepository.updateOne(
        { userId, deviceId },
        { userId, deviceId, deviceType, deviceName },
        {
          upsert: true,
        },
      );
      if (pushNotificationToken || voipToken) {
        await this.pushNotificationTokenRepository.updateOne(
          { deviceId, userId },
          {
            userId,
            deviceId,
            deviceType,
            ...(pushNotificationToken && { pushToken: pushNotificationToken }),
            ...(voipToken && { voipToken }),
          },
          {
            upsert: true,
          },
        );
      }
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
  /**
   * Logout from single device with current login session(jti)
   * Remove access token and refresh token
   */
  async logout(jti: string) {
    try {
      const getTokenMeta = await this.userTokenMetaRepository.findOne({ jti });
      if (getTokenMeta) {
        await this.pushNotificationTokenRepository.deleteMany({
          deviceId: getTokenMeta.deviceId,
        });
      }
      await this.userTokenMetaRepository.deleteMany({
        $and: [{ jti }, { tokenType: { $ne: 'biometric_token' } }],
      });
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * Logout from all device
   * Remove access token and refresh token
   */
  async logoutAll(userId: string) {
    try {
      await this.userTokenMetaRepository.deleteMany({ userId });
      await this.pushNotificationTokenRepository.deleteMany({ userId });
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * @description login with apple
   * @param {AppleLoginInput} appleLoginData apple login data
   * @returns
   */
  async loginWithApple(appleLoginData: AppleLoginInput) {
    try {
      const { idToken, deviceId } = appleLoginData;
      const { sub } = await this.socialAuthService.verifyToken({
        idToken,
        socialAuthProvider: SocialAuthProvider.apple,
      });
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      const user: any = await this.userRepository.findOneAndUpdate(
        {
          authProvider: 'apple',
          authProviderId: sub,
        },
        { lastLoggedInAt, status: UserStatus.email_verified },
        { upsert: true, new: true },
      );
      const payload = {
        username: sub,
        sub: user._id,
        jti,
      };
      const options = ConfigVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenPair(payload, options);
      /**
       * Save user token meta
       * Token has authorization for all api
       */
      /**
       * Currently jti is used as device id later it will be updated once we get device id from user in login
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId,
          authType: 'apple',
          jti,
          grant: 'all',
          tokenType: 'access_token',
          expiresAt: token.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId,
          jti,
          tokenType: 'refresh_token',
          expiresAt: token.refreshTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);

      // Note: uncomment this if comet chat needs to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,
      //   name: user.firstName ? `${user.firstName} ${user.lastName}` : sub,
      // });
      if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }
      return {
        user: {
          ...user.toObject(),
          // cometAuthToken,
        },
        token,
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * @description login with google
   * @param {GoogleLoginInput} googleLoginData google login data
   * @returns
   */
  async loginWithGoogle(googleLoginData: GoogleLoginInput) {
    const { deviceId, idToken } = googleLoginData;
    try {
      const { sub } = await this.socialAuthService.verifyToken({
        idToken,
        socialAuthProvider: SocialAuthProvider.google,
      });
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      const user: any = await this.userRepository.findOneAndUpdate(
        {
          authProvider: 'google',
          authProviderId: sub,
        },
        { lastLoggedInAt, status: UserStatus.email_verified },
        { upsert: true, new: true },
      );
      const payload = {
        username: sub,
        sub: user._id,
        jti,
      };
      const options = ConfigVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenPair(payload, options);
      /**
       * Save user token meta
       * Token has authorization for all api
       */
      /**
       * Currently jti is used as device id later it will be updated once we get device id from user in login
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId,
          authType: 'google',
          jti,
          grant: 'all',
          expiresAt: token.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId,
          authType: 'google',
          jti,
          grant: 'refresh_token',
          expiresAt: token.refreshTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);

      // Note: uncomment this if comet chat needs to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,/home/ebpearls/ebthemes-api/apps/api/src/constants
      //   name: user.firstName ? `${user.firstName} ${user.lastName}` : sub,
      // });
      if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }
      return {
        user: {
          ...user.toObject(),
          // cometAuthToken,
        },
        token,
      };
    } catch (error) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.failed_to_authorize_google'),
      );
    }
  }

  /**
   * @description login with facebook
   * @param {FacebookLoginInput} facebookLoginData google login data
   * @returns
   */
  async loginWithFacebook(facebookLoginData: FacebookLoginInput) {
    const { accessToken, deviceId } = facebookLoginData;
    try {
      const facebookDetails = await this.socialAuthService.verifyToken({
        idToken: accessToken,
        socialAuthProvider: SocialAuthProvider.facebook,
      });
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      const user: any = await this.userRepository.findOneAndUpdate(
        {
          authProvider: 'facebook',
          authProviderId: facebookDetails.id,
        },
        { lastLoggedInAt, status: UserStatus.email_verified },
        { upsert: true, new: true },
      );
      const payload = {
        username: facebookDetails.id,
        sub: user._id,
        jti,
      };

      const options = ConfigVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenPair(payload, options);
      /**
       * Save user token meta
       * Token has authorization for all api
       */
      /**
       * Currently jti is used as device id later it will be updated once we get device id from user in login
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId,
          authType: 'facebook',
          jti,
          grant: 'all',
          tokenType: 'access_token',
          expiresAt: token.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId,
          jti,
          tokenType: 'refresh_token',
          expiresAt: token.refreshTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);

      // Note: uncomment this if comet chat needs to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,
      //   name: user.firstName
      //     ? `${user.firstName} ${user.lastName}`
      //     : facebookDetails.id,
      // });
      if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }
      return {
        user: {
          ...user.toObject(),
          // cometAuthToken,
        },
        token,
      };
    } catch (error) {
      throw new HttpException(
        this.i18nService.t('auth.failed_to_authorize_facebook'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {RequestLoginOTPInput} data
   * @param {*} requestedFor
   * @returns {Promise<{ expiresBy: number; expiresAt: any; }>\}
   */
  async sendEmailOTP(data: RequestLoginOTPInput, requestedFor) {
    const { email, deviceId } = data;

    try {
      // find number of attempt in last 24 hrs
      const last24hrs = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      const getAttemptFromThisDevice = await this.otpRequestRepository.find({
        deviceId,
        expiresAt: { $gte: last24hrs },
      });
      if (getAttemptFromThisDevice?.length > MAX_ATTEMPTS_FROM_DEVICE) {
        throw new BadRequestException(
          this.i18nService.t('auth.too_many_attempts'),
        );
      }
      const currentTime = new Date(new Date().getTime());
      let expiresBy = parseInt(String(SMS_CODE_EXPIRE_BY));
      let expiresAt = null;
      const verificationCode = generateSMSCode();

      const attemptedFromEmail = await this.otpRequestRepository.findOne({
        email,
        requestedFor,
      });
      const values = {
        name: email,
        otp: verificationCode,
        requestedFor,
      };

      if (!attemptedFromEmail) {
        expiresAt = new Date(new Date().getTime() + expiresBy);
        await this.otpRequestRepository.create({
          email,
          deviceId,
          expiresBy,
          expiresAt,
          verificationCode,
          requestedFor,
        });
        this.emailService.sendEmail({
          to: email,
          values,
          slug: requestedFor,
        });

        return {
          message: this.i18nService.t('auth.verification_code_sent_to_email'),
          expiresBy,
          expiresAt,
        };
      }

      if (attemptedFromEmail?.expiresAt > currentTime) {
        expiresAt = attemptedFromEmail?.expiresAt;
        expiresBy = new Date(expiresAt).getTime() - new Date().getTime();
        return {
          message: this.i18nService.t('auth.verification_code_already_sent'),
          expiresAt,
          expiresBy,
        };
      }
      //  multiply expiresBy if attempted after 2 mins and before 2 days
      if (attemptedFromEmail.expiresBy < MULTIPLY_BRFORE_MS) {
        expiresBy =
          attemptedFromEmail.expiresBy *
          parseInt(String(SMS_CODE_EXPIRE_MULTIPLIER));
      }

      expiresAt = new Date(new Date().getTime() + expiresBy);
      await this.otpRequestRepository.updateOne(
        { email },
        {
          deviceId,
          expiresBy,
          expiresAt,
          verificationCode,
          requestedFor,
        },
      );
      this.emailService.sendEmail({
        to: email,
        values: values,
        slug: requestedFor,
      });

      return {
        message: this.i18nService.t('auth.verification_code_sent_to_email'),
        expiresAt,
        expiresBy,
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * Method for sending otp for email login
   * @param {RequestLoginOTPInput} data
   * @param {string} requestedFor
   * @returns
   */
  async loginWithOTP(data: LoginWithOTPInput) {
    const { email, verificationCode } = data;
    try {
      const otpVerification = await this.otpRequestRepository.findOne({
        verificationCode,
        email,
      });
      if (!otpVerification) {
        throw new BadRequestException(
          this.i18nService.t('auth.invalid_verification_code'),
        );
      }
      if (otpVerification.expiresAt < new Date()) {
        throw new BadRequestException(
          this.i18nService.t('auth.invalid_verification_code'),
        );
      }
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      /**
       * Update users last logged in at
       */
      const user: any = await this.userRepository.findOneAndUpdate(
        {
          authProvider: 'email',
          authProviderId: email,
        },
        { lastLoggedInAt, status: UserStatus.email_verified },
        { upsert: true, new: true },
      );
      const payload = {
        username: email,
        sub: user._id,
        jti,
      };
      const options = ConfigVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenPair(payload, options);
      await this.otpRequestRepository.deleteMany({ email });
      /**
       * Save user token meta
       * Token has authorization for all api
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId: otpVerification.deviceId,
          authType: 'email_otp',
          jti,
          grant: 'all',
          tokenType: 'access_token',
          expiresAt: token.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId: otpVerification.deviceId,
          jti,
          tokenType: 'refresh_token',
          expiresAt: token.refreshTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);

      // Note: uncomment if comet chat has to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,
      //   name: user.firstName ? `${user.firstName} ${user.lastName}` : email,
      // });
      if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }
      return {
        user: {
          ...user.toObject(),
          // cometAuthToken,
        },
        token,
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * register with email provider
   * @param {EmailSignupOTPInput} registerData register with email data
   */

  async registerWithEmail(registerData: EmailSignupOTPInput) {
    const { email, deviceId } = registerData;
    try {
      const existingUser = await this.userRepository.findOne({
        authProvider: 'email',
        authProviderId: email,
      });

      if (existingUser) {
        throw new BadRequestException(
          this.i18nService.t('auth.email_already_exists'),
        );
      }
      return this.sendEmailOTP(
        {
          deviceId,
          email,
        },
        RequestedFor.app_user_create_otp,
      );
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * register user with email/password
   * @param {SignupInput} registerUserData register user with provided data
   */
  async registerUser(registerUserData: SignupInput) {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      loginFlowType,
      deviceId,
    } = registerUserData;
    try {
      const existingUser = await this.userRepository.findOne({
        authProvider: 'email',
        authProviderId: email,
      });
      if (existingUser) {
        throw new BadRequestException(
          this.i18nService.t('auth.email_already_exists'),
        );
      }
      const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const lastLoggedInAt = new Date();
      const createData = {
        authProvider: AuthProviderType.email,
        authProviderId: email,
        password: hashPassword,
        loginFlowType,
        lastLoggedInAt,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber?.dialCode &&
          phoneNumber?.number && {
            contacts: {
              phone: {
                type: PhoneContactType.mobile,
                dialCode: phoneNumber.dialCode,
                number: phoneNumber.number,
                isVerified: false,
              },
            },
          }),
      };

      const user = await this.userRepository.create(createData);

      if (loginFlowType === LoginFlowType.link) {
        // send email verificationLink
      }

      const otpResp = await this.sendEmailOTP(
        { email, deviceId },
        RequestedFor.app_user_create_otp,
      );
      return {
        message: 'User registration successful',
        user: {
          ...user.toObject(),
          email: user?.authProviderId,
        },
        expiry: { ...otpResp },
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * resends the otp for verify email in valid case
   * @param {string} email
   * @param {string} deviceId
   * @returns
   */
  async resendVerifyEmailOtp(
    email: string,
    deviceId: string,
  ): Promise<OTPResponse> {
    try {
      const user = await this.userRepository.findOne({
        authProvider: 'email',
        authProviderId: email,
      });
      if (!user) {
        throw new BadRequestException(
          this.i18nService.t('auth.email_does_not_exist'),
        );
      }
      const otpResponse = await this.sendEmailOTP(
        {
          deviceId,
          email,
        },
        RequestedFor.app_login,
      );
      return {
        message: 'Verify email otp sent successfully',
        expiry: { ...otpResponse },
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * @description verify email and login
   * @param {LoginWithOTPInput} data
   * @returns
   */
  async verifyEmailAndLogin(data: LoginWithOTPInput) {
    const { email, verificationCode } = data;
    try {
      const otpVerification = await this.otpRequestRepository.findOne({
        verificationCode,
        email,
      });

      if (!otpVerification) {
        throw new BadRequestException(
          this.i18nService.t('auth.invalid_verification_code'),
        );
      }
      if (otpVerification.expiresAt < new Date()) {
        throw new BadRequestException(
          this.i18nService.t('auth.invalid_verification_code'),
        );
      }
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      /**
       * Update user
       */
      const user: any = await this.userRepository.findOneAndUpdate(
        {
          authProvider: 'email',
          authProviderId: email,
        },
        { lastLoggedInAt, status: UserStatus.email_verified },
        { upsert: true, new: true },
      );

      const tokenPayload = {
        username: email,
        sub: user._id,
        jti,
      };

      const options = ConfigVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenPair(
        tokenPayload,
        options,
      );
      await this.otpRequestRepository.deleteMany({ email });
      /**
       * Save user token meta
       * Token has authorization for all api
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId: otpVerification.deviceId,
          authType: 'email_password',
          jti,
          grant: user?.password ? 'all' : 'set_password', // grant 'all' if user already set password
          tokenType: 'access_token',
          expiresAt: token.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId: otpVerification.deviceId,
          jti,
          tokenType: 'refresh_token',
          expiresAt: token.refreshTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);

      // Note: uncomment if comet chat is to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,
      //   name: `${user.firstName} ${user.lastName}`,
      // });
      if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );

        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }

      return {
        user: {
          ...user.toObject(),
          email: user?.authProviderId,
          // cometAuthToken,
        },
        token,
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * Update grant of access_token
   * @param jti jwt token id
   * @param grant
   */
  async updateGrant(jti: string, grant: string) {
    await this.userTokenMetaRepository.updateOne(
      { jti, tokenType: 'access_token' },
      { grant },
    );
  }

  /**
   * update user password
   * @param email
   * @param password
   */
  async updateUserPassword(email: string, password: string) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.userRepository.updateOne(
      { authProviderId: email },
      { password: hash },
    );
  }

  /**
   * Set first time password and update grant to all
   * @param userId
   * @param email
   * @param password
   * @param jti
   */
  async setPasswordUpdateGrant(userId, password, jti) {
    try {
      const user = await this.userRepository.findById(userId);
      if (user?.password) {
        throw new HttpException(
          this.i18nService.t('auth.password_already_set'),
          HttpStatus.FORBIDDEN,
        );
      }
      const email = user?.authProviderId;
      await this.updateUserPassword(email, password);
      await this.updateGrant(jti, 'all');
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  private isTenMinutesLater(updatedAt: Date) {
    const currentTime = new Date();
    const tenMinutesLater = new Date(updatedAt.getTime() + 5 * 60 * 1000); // Add 10 minutes
    return currentTime >= tenMinutesLater;
  }

  /**
   * login with email password
   * @param {LoginEmailPasswordInput} data login data
   * @returns
   */
  async loginWithEmail(data: LoginEmailPasswordInput) {
    const { email, password, deviceId, ip, agent } = data;
    try {
      const user: any = await this.userRepository.findOne({
        authProviderId: email,
      });

      if (!user?.password || user?.deletedAt) {
        await this.loginInfoRepository.create({
          userId: user?._id,
          userModel: 'User',
          email,
          deviceId: deviceId,
          agent,
          ip,
          loginTime: new Date(),
          failureReason: this.i18nService.t('auth.user_not_found'),
          isSuccessful: false,
        });

        throw new BadRequestException(
          this.i18nService.t('auth.invalid_credentials'),
        );
      }

      if (
        user.invalidLoginCount >= 5 &&
        !this.isTenMinutesLater(user.updatedAt)
      ) {
        throw new BadRequestException(
          this.i18nService.t('auth.user_block_due_to_multiple_invalid_login'),
        );
      }

      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        await this.loginInfoRepository.create({
          userId: user._id,
          userModel: 'User',
          deviceId: deviceId,
          agent,
          ip,
          loginTime: new Date(),
          failureReason: this.i18nService.t('auth.password_not_matched'),
          isSuccessful: false,
        });

        await this.userRepository.updateById(user._id, {
          invalidLoginCount: (user?.invalidLoginCount || 0) + 1,
        });

        throw new BadRequestException(
          this.i18nService.t('auth.invalid_credentials'),
        );
      }
      // check if user's email verification is pending
      if (user.status === UserStatus.email_verification_pending) {
        const otpRes = await this.sendEmailOTP(
          {
            deviceId,
            email,
          },
          RequestedFor.app_login,
        );
        return {
          message: this.i18nService.t('auth.verification_code_sent_to_email'),
          user: { ...user.toObject(), email: user.authProviderId },
          expiry: {
            ...otpRes,
          },
        };
      }
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      const payload = {
        username: email,
        sub: user._id,
        jti,
      };
      const options = ConfigVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenPair(payload, options);
      /**
       * Save user token meta
       * Token has authorization for all api
       */

      /**
       * Currently jti is used as device id later it will be updated once we get device id from user in login
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId,
          authType: 'email_password',
          jti,
          grant: 'all',
          tokenType: 'access_token',
          expiresAt: token.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId,
          jti,
          tokenType: 'refresh_token',
          expiresAt: token.refreshTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);
      /**
       * update last logged in at
       */
      const updatedUser: any = await this.userRepository.findOneAndUpdate(
        {
          _id: user._id,
        },
        { lastLoggedInAt, invalidLoginCount: 0 },
        { new: true },
      );

      // Note: uncomment if comet chat has to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,
      //   name: `${user.firstName} ${user.lastName}`,
      // });

      return {
        user: {
          ...updatedUser?.toObject(),
          email: updatedUser?.authProviderId,
          // cometAuthToken,
        },
        token,
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   *
   * @param email Verify password
   * @param password
   * @returns
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      throw new ForbiddenException(
        this.i18nService.t('auth.passwod_change_password_not_matched'),
      );
    }
    return true;
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {string} userId
   * @param {string} password
   * @returns {Promise<void>}
   */
  async updateUserPasswordById(userId: string, password: string) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await this.userRepository.updateById(userId, { password: hash });
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {ForgotPasswordInput} data
   * @returns {Promise<{ expiresBy: number; expiresAt: any; }>\}
   */
  async forgotPassword(data: ForgotPasswordInput) {
    const { email } = data;

    try {
      const existingUser = await this.userRepository.findOne({
        authProvider: 'email',
        authProviderId: email,
      });
      if (!existingUser || existingUser?.deletedAt) {
        throw new BadRequestException(
          this.i18nService.t('auth.email_does_not_exist'),
        );
      }
      return this.sendEmailOTP(data, RequestedFor.forgot_password_otp);
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {string} email
   * @param {string} verificationCode
   * @returns {Promise<any>}
   */
  async verifyResetPasswordCode(
    email: string,
    verificationCode: string,
  ): Promise<any> {
    try {
      const getCodeRequest = await this.otpRequestRepository.findOne({
        email,
        verificationCode,
        requestedFor: RequestedFor.forgot_password_otp,
        expiresAt: { $gt: new Date() },
      });
      await this.userRepository.updateOne(
        {
          authProvider: 'email',
          authProviderId: email,
        },
        {
          status: UserStatus.email_verified,
        },
      );
      return !!getCodeRequest;
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  async updateUserPasswordAndDeleteOtp(email: string, password: string) {
    try {
      await this.updateUserPassword(email, password);
      await this.otpRequestRepository.deleteMany({
        email: email,
        requestedFor: RequestedFor.forgot_password,
      });
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
  /**
   * verify code and reset password
   * @param {string} email
   * @param {string} password
   * @param {string} verificationCode
   */
  async resetPassword(
    email: string,
    password: string,
    verificationCode: string,
  ) {
    try {
      const isValidVerificationCode = await this.verifyResetPasswordCode(
        email,
        verificationCode,
      );
      if (!isValidVerificationCode) {
        throw new BadRequestException(
          this.i18nService.t('auth.invalid_verification_code'),
        );
      }
      const user = await this.userRepository.findOne({
        authProviderId: email,
        deletedAt: null,
      });

      if (!user)
        throw new NotFoundException(
          this.i18nService.t('auth.email_does_not_exist'),
        );

      // Don't update password if password is already set and is same as before.
      if (user.password && HashHelper.compare(password, user.password)) {
        throw new BadRequestException(
          this.i18nService.t('auth.cannot_update_same_password'),
        );
      }
      await this.updateUserPasswordAndDeleteOtp(email, password);
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * Refresh token
   * @param {string} refreshToken
   */
  async refresh(refreshToken: string) {
    try {
      const options = ConfigVariableService.jwtTokenConfig();
      const secret = options.refreshTokenSecret;
      const decoded = await decodeJwtToken(refreshToken, secret);
      if (!decoded?.jti || !decoded?.username) {
        throw new ForbiddenException(this.i18nService.t('auth.unauthorized'));
      }
      /**
       * Remove access token and refresh token
       */
      const user = await this.userRepository.findOne({
        authProviderId: decoded.username,
      });
      if (!user || user?.deletedAt) {
        throw new ForbiddenException(this.i18nService.t('auth.unauthorized'));
      }
      const payload = {
        username: user.authProviderId,
        sub: user._id,
        jti: decoded.jti,
      };
      const token = this.jwtTokenService.generateTokenPair(payload, options);
      /**
       * Update user token meta
       * Token has authorization for all api
       */

      await this.userTokenMetaRepository.updateOne(
        {
          userId: user._id,
          tokenType: 'access_token',
          jti: decoded.jti,
        },
        {
          expiresAt: token.accessTokenExpiresIn,
          grant: 'all',
          // jti: decoded.jti,
        },
        { upsert: true },
      );
      await this.userTokenMetaRepository.updateOne(
        {
          userId: user._id,
          tokenType: 'refresh_token',
          jti: decoded.jti,
        },
        {
          expiresAt: token.refreshTokenExpiresIn,
          // jti: decoded.jti
        },
        { upsert: true },
      );

      return token;
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  /**
   * @description login with tiktok
   * @param {TiktokLoginInput} tiktokLoginData login data
   * @returns
   */
  async loginWithTiktok(tiktokLoginData: TiktokLoginInput) {
    const { code, deviceId } = tiktokLoginData;
    try {
      const tiktokDetails = await this.socialAuthService.verifyToken({
        idToken: code,
        socialAuthProvider: SocialAuthProvider.tiktok,
      });
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      const user: any = await this.userRepository.findOneAndUpdate(
        {
          authProvider: 'tiktok',
          authProviderId: tiktokDetails.union_id,
        },
        { lastLoggedInAt, status: UserStatus.email_verified },
        { upsert: true, new: true },
      );
      const payload = {
        username: tiktokDetails.union_id,
        sub: user._id,
        jti,
      };

      const options = ConfigVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenPair(payload, options);
      /**
       * Save user token meta
       * Token has authorization for all api
       */
      /**
       * Currently jti is used as device id later it will be updated once we get device id from user in login
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId,
          authType: 'tiktok',
          jti,
          grant: 'all',
          tokenType: 'access_token',
          expiresAt: token.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId,
          jti,
          tokenType: 'refresh_token',
          expiresAt: token.refreshTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);

      // Note: uncomment this if comet chat needs to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,
      //   name: user.firstName
      //     ? `${user.firstName} ${user.lastName}`
      //     : tiktokDetails.union_id,
      // });

      if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }
      return {
        user: {
          ...user.toObject(),
          // cometAuthToken,
        },
        token,
      };
    } catch (error) {
      throw new HttpException(
        this.i18nService.t('auth.failed_to_authorize_tiktok'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  /**
   * @description generate new token for biometric authentication
   * @param {LoginDetailType}  loginDetail data
   * @returns
   */
  async enableBiometricAuth(loginDetail: LoginDetailType, deviceId: string) {
    const { userId } = loginDetail;
    try {
      const user: any = await this.userRepository.findById(userId, {
        isBiometricEnabled: 1,
        authProviderId: 1,
      });
      const jti = uuidv4();
      const payload = {
        username: user.authProviderId,
        sub: user._id,
        jti,
      };
      const options = ConfigBiometricVariableService.jwtTokenConfig();
      const token = this.jwtTokenService.generateTokenForBiometric(
        payload,
        options,
      );
      /**
       * Save user token meta
       * Token has authorization for all api
       */

      const saveTokenMeta: Partial<UserTokenMeta> = {
        userId: user._id,
        authType: 'biometric',
        jti,
        grant: 'biometric_login',
        tokenType: 'biometric_token',
        expiresAt: token.biometricTokenExpiresIn,
      };

      if (user?.isBiometricEnabled) {
        await this.userTokenMetaRepository.updateOne(
          { deviceId },
          saveTokenMeta,
        );
      } else {
        saveTokenMeta.deviceId = deviceId;
        await this.userTokenMetaRepository.create(saveTokenMeta);
        await this.userRepository.updateOne(
          {
            _id: user._id,
          },
          { isBiometricEnabled: true },
        );
      }
      return {
        token,
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
  /**
   * @description generate new accesstoken, refreshToken and biometricToken for biometric authentication
   * @param {LoginDetailType}  loginDetail data
   * @returns
   */
  async loginWithBiometric(biometricToken: string, deviceId: string) {
    try {
      const biometricOptions = ConfigBiometricVariableService.jwtTokenConfig();
      const secret = biometricOptions.biometricTokenSecret;
      const decoded = await decodeJwtToken(biometricToken, secret);
      if (!decoded?.jti || !decoded?.username) {
        throw new ForbiddenException(this.i18nService.t('auth.unauthorized'));
      }
      /**
       * Remove access token and refresh token
       */
      const user: any = await this.userRepository.findOne({
        authProviderId: decoded.username,
      });
      if (!user || user?.deletedAt) {
        throw new ForbiddenException(this.i18nService.t('auth.unauthorized'));
      }
      const loginMeta = await this.userTokenMetaRepository.findOne(
        {
          userId: decoded.sub,
          jti: decoded.jti,
          deviceId,
          tokenType: 'biometric_token',
          grant: 'biometric_login',
        },
        { jti: 1, userId: 1, tokenType: 1, grant: 1 },
      );
      if (!loginMeta) {
        throw new HttpException(
          this.i18nService.t('auth.unauthorized'),
          HttpStatus.UNAUTHORIZED,
        );
      }
      const lastLoggedInAt = new Date();
      const jti = uuidv4();
      const options = ConfigVariableService.jwtTokenConfig();
      const payload = {
        username: user.authProviderId,
        sub: user._id,
        jti,
      };
      const tokens = this.jwtTokenService.generateTokenPair(payload, options);
      const biometricPayload = {
        username: user.authProviderId,
        sub: user._id,
        jti,
      };
      const biometricTokenDetails =
        this.jwtTokenService.generateTokenForBiometric(
          biometricPayload,
          biometricOptions,
        );
      /**
       * Save user token meta
       * Token has authorization for all api
       */
      /**
       * Currently jti is used as device id later it will be updated once we get device id from user in login
       */
      const saveTokenMeta: Partial<UserTokenMeta>[] = [
        {
          userId: user._id,
          deviceId,
          authType: 'biometric',
          jti,
          grant: 'all',
          tokenType: 'access_token',
          expiresAt: tokens.accessTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId,
          jti,
          tokenType: 'refresh_token',
          expiresAt: tokens.refreshTokenExpiresIn,
        },
        {
          userId: user._id,
          deviceId,
          jti,
          tokenType: 'biometric_token',
          grant: 'biometric_login',
          expiresAt: biometricTokenDetails.biometricTokenExpiresIn,
        },
      ];
      await this.userTokenMetaRepository.createMany(saveTokenMeta);

      // Note: uncomment this if comet chat needs to be implemented
      // const cometAuthToken = await this.getCometChatAuthTokenOfUser({
      //   uid: user._id,
      //   name: `${user.firstName} ${user.lastName}`,
      // });

      await this.userRepository.updateOne(
        {
          _id: user._id,
        },
        { lastLoggedInAt },
        { new: true },
      );

      return {
        ...tokens,
        ...biometricTokenDetails,
        // cometAuthToken
      };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
}
