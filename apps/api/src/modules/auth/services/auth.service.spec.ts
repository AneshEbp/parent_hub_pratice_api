import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  DeviceInfoRepository,
  OTPRequestRepository,
  PushNotificationTokenRepository,
  UserTokenMetaRepository,
  UsersRepository,
} from '@app/data-access';
import { UserStatus } from '@app/common/enum/user-status.enum';
import { AppleAuthService } from '@app/apple-auth';
import { JwtTokenService } from '@app/authentication';
import { JwtService } from '@nestjs/jwt';
import { S3Service, SesService } from '@app/common/services/s3';
import { FacebookAuthService } from '@app/facebook-auth';
import { GoogleAuthService } from '@app/google-auth';
import { ConfigService } from '@nestjs/config';
import { LoginEmailPasswordInput } from '../dto/input/login-email-password.input';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; firstName: string; lastName: string; password: string; status: any; }\}
 */
const mockUser = {
  _id: '643fa2d72dfdfc02d0b233ed',
  authProvider: 'email',
  authProviderId: 'test@example.com',
  firstName: 'first name',
  lastName: 'last name',
  password: 'test123@',
  status: UserStatus.email_verified,
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; firstName: string; lastName: string; }\}
 */
const mockUser2 = {
  _id: '643fa2d72dfdfc02d0b233ff',
  authProvider: 'email',
  authProviderId: 'foo@example.com',
  firstName: 'foo',
  lastName: 'bar',
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; firstName: string; lastName: string; status: any; password: string; detetedAt: string; }\}
 */
const deletedUserMock = {
  _id: '643fa2d72dfdfc02d0b233gg',
  authProvider: 'email',
  authProviderId: 'test1@example.com',
  firstName: 'foo',
  lastName: 'bar',
  status: UserStatus.email_verified,
  password: 'test123@',
  detetedAt: '2023-06-07 05:22:46.705Z',
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; status: any; password: string; }\}
 */
const mockUser4 = {
  _id: '643fa2d72dfdfc02d0b233hh',
  authProvider: 'email',
  authProviderId: 'test2@example.com',
  status: UserStatus.email_verification_pending,
  password: '$2b$10$3YnHydKyLbtY0/MJ9rQGRuTGFEIK3yRCm07yhaopG38onjsbd7TNq',
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ toObject: () => { _id: string; authProvider: string; authProviderId: string; status: any; password: string; }; _id: string; authProvider: string; authProviderId: string; status: any; password: string; \}\}
 */
const mockUser5 = {
  ...mockUser4,
  toObject: () => ({
    ...mockUser4,
  }),
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; status: any; password: string; }\}
 */
const mockUser6 = {
  _id: '643fa2d72dfdfc02d0b233kk',
  authProvider: 'email',
  authProviderId: 'test3@example.com',
  status: UserStatus.email_verified,
  password: '$2b$10$r.MgIofQACz6nIzyoY.tkeJw6TJQahQSns7jCRlXlwdnr5GeHdXPW',
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ toObject: () => { _id: string; authProvider: string; authProviderId: string; status: any; password: string; }; _id: string; authProvider: string; authProviderId: string; status: any; password: string; \}\}
 */
const mockUser7 = {
  ...mockUser6,
  toObject: () => ({
    ...mockUser6,
  }),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AppleAuthService,
        JwtTokenService,
        JwtService,
        S3Service,
        SesService,
        ConfigService,
        FacebookAuthService,
        GoogleAuthService,
        UserTokenMetaRepository,
        DeviceInfoRepository,
        OTPRequestRepository,
        PushNotificationTokenRepository,
        UsersRepository,
        {
          provide: AppleAuthService,
          useValue: {},
        },
        {
          provide: FacebookAuthService,
          useValue: {},
        },
        {
          provide: GoogleAuthService,
          useValue: {},
        },
        {
          provide: SesService,
          useValue: {},
        },
        {
          provide: JwtTokenService,
          useValue: {
            generateTokenPair: jest.fn().mockResolvedValue({
              accessToken: 'accessToken',
              accessTokenExpiresIn: new Date(),
              refreshToken: 'refreshToken',
              refreshTokenExpiresIn: new Date(),
            }),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: UserTokenMetaRepository,
          useValue: {
            createMany: jest.fn(),
          },
        },
        {
          provide: DeviceInfoRepository,
          useValue: {},
        },
        {
          provide: OTPRequestRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },

        {
          provide: PushNotificationTokenRepository,
          useValue: {},
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
  });

  describe('Me', () => {
    it('should return the loggedin user details', async () => {
      const findByIdSpy = jest.spyOn(usersRepository, 'findById').mockResolvedValue(mockUser);
      const user = await authService.me('643fa2d72dfdfc02d0b233ed');
      expect(findByIdSpy).toHaveBeenCalledWith('643fa2d72dfdfc02d0b233ed');
      expect(user).not.toBe(null);
      expect(typeof user).toBe('object');
      expect(user).toEqual(mockUser);
    });

    it('should return null for non-existing userId', async () => {
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(null);
      const user = await authService.me('643fa2d72dfdfc02d0b233ef');
      expect(user).toEqual(null);
    });
  });

  describe('loginWIthEmail', () => {
    it('should return ForbiddenExceptionError for non-existent email', async () => {
      const loginData: LoginEmailPasswordInput = {
        deviceId: '123',
        email: 'bar@example.com',
        password: 'test123@',
      };
      const findOneSpy = jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser2);
      try {
        await authService.loginWithEmail(loginData);
        expect(findOneSpy).toHaveBeenCalledWith({
          authProviderId: loginData.email,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toEqual('Invalid login credentials.');
      }
    });

    it('should return ForbiddenExceptionError if user does not have password property', async () => {
      const loginData: LoginEmailPasswordInput = {
        deviceId: '123',
        email: 'foo@example.com',
        password: 'test123@',
      };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser2);
      try {
        await authService.loginWithEmail(loginData);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toEqual('Invalid login credentials.');
      }
    });

    it('should return ForbiddenExceptionError if user is deleted', async () => {
      const loginData: LoginEmailPasswordInput = {
        deviceId: '123',
        email: 'test@example.com',
        password: 'test123@',
      };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(deletedUserMock);
      try {
        await authService.loginWithEmail(loginData);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toEqual('Invalid login credentials.');
      }
    });

    it('should return ForbiddenExceptionError for invalid password', async () => {
      const loginData: LoginEmailPasswordInput = {
        deviceId: '123',
        email: 'test@example.com',
        password: 'test123',
      };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      try {
        await authService.loginWithEmail(loginData);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toEqual('Invalid login credentials.');
      }
    });

    it('should return message with expiry for email_verification_pending', async () => {
      const loginData: LoginEmailPasswordInput = {
        deviceId: '123',
        email: 'test2@example.com',
        password: 'test123@',
      };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser5);

      const otpRes = {
        expiresAt: new Date(),
        expiresBy: 120000,
      };
      const sendEmailOtpSpy = jest.spyOn(authService, 'sendEmailOTP').mockResolvedValue(otpRes);
      const result = await authService.loginWithEmail(loginData);
      expect(sendEmailOtpSpy).toHaveBeenCalledWith(
        {
          deviceId: loginData.deviceId,
          email: loginData.email,
        },
        'app-login',
      );

      expect(typeof result).toBe('object');
      expect(Object.keys(result)).toEqual(['message', 'user', 'expiry']);
      expect(typeof result.user).toBe('object');
      expect(typeof result.expiry).toBe('object');
      expect(result.message).toEqual(
        'Verification code sent to your email please use that code to verify your email',
      );
      expect(result.expiry).toEqual(otpRes);
      expect(result.user).toEqual({
        ...mockUser4,
        email: mockUser4.authProviderId,
      });
    });

    it('should login user if email verified', async () => {
      const loginData1: LoginEmailPasswordInput = {
        deviceId: '123',
        email: 'test3@example.com',
        password: 'Password@1',
      };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser6);
      jest.spyOn(usersRepository, 'updateOne').mockResolvedValue(mockUser7);
      const result = await authService.loginWithEmail(loginData1);
      expect(typeof result).toBe('object');
      expect(typeof result.user).toBe('object');
      expect(result.user.email).toBeDefined();
      expect(typeof result.token).toBe('object');
      expect(result.user).toEqual({
        ...mockUser6,
        email: mockUser6.authProviderId,
      });
    });
  });

  describe('forgotPassword', () => {
    it('should throw BadRequestException for non-existent email', async () => {
      const forgotPayload = {
        email: 'foo@example.com',
        deviceId: '12345',
      };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      try {
        await authService.forgotPassword(forgotPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Email does not exists.');
      }
    });

    it('should throw BadRequestException for deleted user', async () => {
      const forgotPayload = {
        email: 'test1@example.com',
        deviceId: '12345',
      };
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(deletedUserMock);
      jest.spyOn(authService, 'sendEmailOTP').mockResolvedValue({
        expiresAt: new Date(),
        expiresBy: 120000,
      });
      try {
        await authService.forgotPassword(forgotPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Email does not exists.');
      }
    });

    it('should respond with expiry object', async () => {
      const forgotPayload = {
        email: 'test@example.com',
        deviceId: '12345',
      };
      const expiryRes = {
        expiresAt: new Date(),
        expiresBy: 120000,
      };
      const findOneSpy = jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      const sendEmailOTPSpy = jest.spyOn(authService, 'sendEmailOTP').mockResolvedValue(expiryRes);
      const result = await authService.forgotPassword(forgotPayload);
      expect(findOneSpy).toHaveBeenCalledWith({
        authProvider: 'email',
        authProviderId: forgotPayload.email,
      });
      expect(sendEmailOTPSpy).toHaveBeenCalledWith(forgotPayload, 'forgot-password');
      expect(typeof result).toBe('object');
      expect(Object.keys(result)).toEqual(['expiresAt', 'expiresBy']);
      expect(result).toEqual(expiryRes);
    });
  });
});
