import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  DeviceInfoRepository,
  OTPRequestRepository,
  TokenRepository,
  UserTokenMetaRepository,
  UsersRepository,
} from '@app/data-access';
// import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthService } from '../auth/services/auth.service';
import { S3Service } from '@app/common/services/s3';
import { UserStatus } from '@app/common/enum/user-status.enum';
import { UpdateUserEmailDto } from './dto/input/update-email.input';
import { BadRequestException } from '@nestjs/common';

// const moduleMocker = new ModuleMocker(global);

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; firstName: string; lastName: string; status: any; detetedAt: string; }\}
 */
const mockUser = {
  _id: '643fa2d72dfdfc02d0b233ed',
  authProvider: 'email',
  authProviderId: 'test35@getnada.com',
  firstName: 'first name',
  lastName: 'last name',
  status: UserStatus.email_verified,
  detetedAt: '2023-06-07 05:22:46.705Z',
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; firstName: string; lastName: string; status: any; }\}
 */
const mockUser2 = {
  _id: '643fa2d72dfdfc02d0b233ee',
  authProvider: 'email',
  authProviderId: 'test36@getnada.com',
  firstName: 'first name 1',
  lastName: 'last name 2',
  status: UserStatus.email_verified,
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ _id: string; authProvider: string; authProviderId: string; firstName: string; lastName: string; status: any; }\}
 */
const mockUser3 = {
  _id: '643fa2d72dfdfc02d0b233ef',
  authProvider: 'email',
  authProviderId: 'test38@getnada.com',
  firstName: 'first name 2',
  lastName: 'last name 3',
  status: UserStatus.email_verified,
};

/**
 * ${1:Description placeholder}
 *
 * @type {{ data: { _id: string; authProvider: string; authProviderId: string; firstName: string; lastName: string; status: any; }[]; pagination: { total: number; hasNextPage: boolean; \}; \}\}
 */
const getAllUserMock = {
  data: [mockUser, mockUser2],
  pagination: {
    total: 2,
    hasNextPage: false,
  },
};

describe('UsersService', () => {
  let usersService: UsersService;
  let authService: AuthService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        AuthService,
        S3Service,
        UsersRepository,
        TokenRepository,
        UserTokenMetaRepository,
        DeviceInfoRepository,
        OTPRequestRepository,
        {
          provide: UsersRepository,
          useValue: {
            getAllUsers: jest.fn(),
            getUsers: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            sendEmailOTP: jest.fn(),
          },
        },
        {
          provide: TokenRepository,
          useValue: {},
        },
        {
          provide: UserTokenMetaRepository,
          useValue: {},
        },
        {
          provide: DeviceInfoRepository,
          useValue: {},
        },
        {
          provide: OTPRequestRepository,
          useValue: {},
        },
      ],
    })
      // .useMocker((token) => {
      //   if (token === UsersRepository) {
      //     return {
      //       // findAll: jest.fn().mockResolvedValue(results),
      //       getAllUsers: jest.fn(),
      //       getUsers: jest.fn(),
      //       findOne: jest.fn().mockResolvedValue(mockUser2),
      //     };
      //   }
      //   if (typeof token === 'function') {
      //     const mockMetadata = moduleMocker.getMetadata(
      //       token,
      //     ) as MockFunctionMetadata<any, any>;
      //     const Mock = moduleMocker.generateFromMetadata(mockMetadata);
      //     return new Mock();
      //   }
      // })
      .compile();
    usersService = moduleRef.get<UsersService>(UsersService);
    authService = moduleRef.get<AuthService>(AuthService);
    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
  });

  it('UsersService - should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user with email', async () => {
      const findOneSpy = jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser2);
      const user = await usersService.findByEmail('test36@getnada.com');
      expect(findOneSpy).toHaveBeenCalledWith({
        authProviderId: 'test36@getnada.com',
        deletedAt: null,
      });
      expect(user).not.toBe(null);
      expect(typeof user).toBe('object');
      expect(user).toEqual(mockUser2);
    });

    it('should return null for non-existing email', async () => {
      const findOneSpy = jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      const user = await usersService.findByEmail('test37@getnada.com');
      expect(findOneSpy).toHaveBeenCalledWith({
        authProviderId: 'test37@getnada.com',
        deletedAt: null,
      });
      expect(user).toEqual(null);
    });

    it('should return null deleted user', async () => {
      const findOneSpy = jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      const user = await usersService.findByEmail('test35@getnada.com');
      expect(findOneSpy).toHaveBeenCalledWith({
        authProviderId: 'test35@getnada.com',
        deletedAt: null,
      });
      expect(user).toEqual(null);
    });
  });

  describe('updateEmail', () => {
    it('should throw BadRequestException for attempt to update same email', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser2);

      const updateData: UpdateUserEmailDto = {
        email: 'test36@getnada.com',
        deviceId: '123456',
      };

      try {
        await usersService.updateEmail('643fa2d72dfdfc02d0b233ee', updateData);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('Can not update the same email address');
      }
    });

    it('should throw BadRequestException for already existing email', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser3);
      const updateData: UpdateUserEmailDto = {
        email: 'test38@getnada.com',
        deviceId: '123456',
      };

      try {
        await usersService.updateEmail('643fa2d72dfdfc02d0b233ee', updateData);
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('Email not available.');
      }
    });

    it('should update email', async () => {
      const updateData: UpdateUserEmailDto = {
        email: 'test39@getnada.com',
        deviceId: '123456',
      };
      const otpResponseMock = {
        expiresBy: 12345678,
        expiresAt: '2023-06-08 05:22:46.705Z',
      };
      const otpRespSpy = jest.spyOn(authService, 'sendEmailOTP').mockResolvedValue(otpResponseMock);
      const result = await usersService.updateEmail('643fa2d72dfdfc02d0b233ee', updateData);
      expect(otpRespSpy).toHaveBeenCalledWith(updateData, 'update-email');
      expect(typeof result).toBe('object');
      expect(Object.keys(result)).toEqual(['message', 'expiry']);
      expect(result.message).toBe(
        'Verification code sent to your email please use that code to verify your email',
      );
      expect(typeof result.expiry).toBe('object');
      expect(result.expiry).toEqual(otpResponseMock);
    });
  });
});
