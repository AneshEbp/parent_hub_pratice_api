import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DeviceInfoRepository,
  OTPRequestRepository,
  TokenRepository,
  UserTokenMetaRepository,
  UsersRepository,
} from '@app/data-access';
import { UserResponse } from '../../common/dto/user.response';
import { UpdateUserEmailDto } from './dto/input/update-email.input';
import { RequestedFor } from '@app/common/enum/otp-request.enum';
import { OTPResponse } from '../auth/dto/response/otp.response';
import { VerifyEmailInput } from '../auth/dto/input/verify-email.input';
import { UpdateUserProfile } from '../auth/dto/input/update-user-profile';
import { UpdateProfilInterface } from '../auth/dto/Interface/update.user.interface';
import { LocationType } from '@app/common/enum/location-type.enum';
import { ProfileUpdateResponse } from './dto/response/profile-update.response';
import { S3Service, S3_TEMP_FOLDER_NAME } from '@app/common/services/s3';
import { SignedUrlMethod } from '@app/common/enum/signed-url.enum';
import { getDynamicDate, isAllowedExt } from '@app/common/helpers/genericFunction';
import { MessageResponse } from '@app/common/dto/response/message.response';
import { ListUseProfilesDTO } from './dto/input/list-user.dto';
import { Order } from '@app/common/enum/pagination';
import { I18nService } from 'nestjs-i18n';
// import { PageStatus } from '@app/common/enum/page-status.enum';
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';
import { AuthService } from '../auth/services/auth.service';
import { PageStatus, PageType } from '@app/data-access/page/page.enum';
import { PageRepository } from '@app/data-access/page';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UsersService
 * @typedef {UsersService}
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly agoraHelperService: AgoraHelperService,
    private readonly userRepository: UsersRepository,
    private readonly emailTokenRepo: TokenRepository,
    private readonly tokenMetaRepo: UserTokenMetaRepository,
    private readonly deviceInfoRepo: DeviceInfoRepository,
    private readonly otpRequestRepo: OTPRequestRepository,
    private readonly pageRepo: PageRepository,
    private readonly i18nService: I18nService,
    private readonly authService: AuthService,
  ) { }

  /**
   * @description get user by email
   * @param {string} email
   * @returns
   */
  async findByEmail(email: string): Promise<UserResponse> {
    return this.userRepository.findOne({
      authProviderId: email,
      deletedAt: null,
    }) as any;
  }

  /**
   * @description get user by userId
   * @param {string} userId user id
   * @returns
   */
  async findById(userId: string, projection = {}): Promise<UserResponse> {
    try {
      const user: any = await this.userRepository.findOne(
        {
          _id: userId,
          deletedAt: null,
        },
        projection,
      );
      if (user?.profileImage) {
        const profileImageKey = `${user.profileImage}`;
        user.profileImage = await this.s3Service.getPreSignedUrl(
          profileImageKey,
          SignedUrlMethod.GET,
        );
        user.profileImageThumbnails = await this.s3Service.getAllThumbnail(profileImageKey);
      }
      return user;
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }

  /**
   * Batch fetch users by ids with projection.
   */
  async findByIds(userIds: string[], projection = {}) {
    try {
      const users: any[] = await this.userRepository.find(
        { _id: { $in: userIds }, deletedAt: null },
        projection,
      );
      for (const user of users) {
        if (user?.profileImage) {
          const profileImageKey = `${user.profileImage}`;
          user.profileImage = await this.s3Service.getPreSignedUrl(
            profileImageKey,
            SignedUrlMethod.GET,
          );
          user.profileImageThumbnails = await this.s3Service.getAllThumbnail(profileImageKey);
        }
      }
      return users;
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }

  /**
   * @description list user profiles
   * @param {ListUseProfilesDTO} input user listing input
   * @returns
   */
  async findUserProfiles(input: ListUseProfilesDTO, userId: string) {
    try {
      const { searchText, orderBy, order, limit, skip } = input;

      const pageMeta = {
        limit,
        skip,
      };

      const sortQuery = { [orderBy]: order === Order.ASC ? 1 : -1 };

      const { data, pagination } = await this.userRepository.getAllUserProfiles(
        userId,
        pageMeta,
        sortQuery,
        searchText,
      );
      for (const user of data) {
        if (user?.profileImage) {
          user.profileImage = await this.s3Service.getPreSignedUrl(
            user.profileImage,
            SignedUrlMethod.GET,
          );

          user.profileImageThumbnails = await this.s3Service.getAllThumbnail(user.profileImage);
        }
      }
      return {
        message: this.i18nService.t('users.user_list'),
        users: data,
        pagination,
      };
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }

  /**
   * @description get the current logged in user
   * @param userId user id
   * @returns the current logged in user
   */
  async me(userId: string, projection = {}) {
    try {
      const user = await this.findById(userId, projection);
      if (user?.address) {
        user.address = {
          displayAddress: user.address.displayAddress,
          location: {
            ...user.address.location,
            ...(user.address?.location?.coordinates && {
              coordinates: {
                long: user.address?.location?.coordinates[0],
                lat: user.address?.location?.coordinates[1],
              },
            }),
          },
        };
      }

      return user;
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }

  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {string} userId
   * @param {UpdateUserProfile} data
   * @returns {Promise<{ message: any; user: ProfileUpdateResponse; }>\}
   */

  async updateProfile(userId: string, data: UpdateUserProfile) {
    try {
      const { firstName, lastName, address, bio, profileImage } = data;
      const updates: UpdateProfilInterface = {};
      console.log(data)
      // Set basic fields
      // this.setBasicUserFields(firstName, lastName, bio, updates);

      // Fetch user data
      const user = await this.userRepository.findById(userId, { profileImage: 1 });
      // const prevImageKey = user?.profileImage;

      // Handle profile image update
      const isProfileUpdated=true
      // const isProfileUpdated = await this.handleProfileImageUpdate(
      //   profileImage,
      //   prevImageKey,
      //   updates,
      //   userId,
      // );

      // Handle address update
      // this.setAddressFields(address, updates);

      updates.firstName=data.firstName
      // Perform user update
      const userUpdate = await this.userRepository.updateById(userId, updates, { new: true });
      console.log("userupdates", userUpdate)
      // Update Agora if necessary
      if (userUpdate?.agoraUuid ) {
        await this.updateAgoraUser(userUpdate, userId);
      }

      // Prepare response object
      const userResp = await this.prepareUserResponse(
        userUpdate,
        profileImage,
        userId,
        isProfileUpdated,
      );

      return { message: this.i18nService.t('users.profile_updated_successfully'), user: userResp };
    } catch (e) {
      throw new BadRequestException(e?.message);
    }
  }

  private setBasicUserFields(
    firstName: string,
    lastName: string,
    bio: string,
    updates: UpdateProfilInterface,
  ) {
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (bio !== undefined) updates.bio = bio;
  }

  private async handleProfileImageUpdate(
    profileImage: string | undefined,
    prevImageKey: string | undefined,
    updates: UpdateProfilInterface,
    userId: string,
  ) {
    let isProfileUpdated = false;

    if (profileImage !== undefined) {
      const allowedExtensions = ['jpg', 'png', 'jpeg'];
      if (profileImage && !isAllowedExt(profileImage, allowedExtensions)) {
        throw new BadRequestException(this.i18nService.t('users.invalid_extension'));
      }

      if (profileImage !== prevImageKey) {
        isProfileUpdated = true;
        updates.profileImage = profileImage;
      }
    }
    return isProfileUpdated;
  }

  private setAddressFields(address, updates: UpdateProfilInterface) {
    if (address !== undefined) {
      updates.address = {
        displayAddress: address.displayAddress,
        location: {
          type: address.type,
          ...(address.type === LocationType.Point &&
            address?.coordinates && {
            coordinates: [address?.coordinates['long'], address?.coordinates['lat']],
          }),
          ...(address.type === LocationType.Address && {
            country: address?.country,
            state: address?.state,
            city: address?.city,
            street: address?.street,
            postalCode: address?.postalCode,
          }),
        },
      };
    }
  }

  private async updateAgoraUser(userUpdate: any, userId: string) {
    console.log("here")
    await this.agoraHelperService.updateChatUser(userId, {
      nickname: userUpdate.firstName,
      // avatarurl: await this.s3Service.getS3Url(
      //   `public/profiles/${userId}/${userUpdate?.profileImage}`,
      // ),
      ...(userUpdate?.authProvider === 'email' && {
        mail: userUpdate?.authProviderId,
      }),
    });
  }

   async updateAgoraUsers(userUpdate: any, userId: string) {
    await this.agoraHelperService.updateChatUser(userId, {
      nickname: userUpdate.nickname,
      avatarurl: userUpdate.profileUrl,
      ...(userUpdate?.authProvider === 'email' && {
        mail: userUpdate?.authProviderId,
      }),
    });
  }

  private async prepareUserResponse(
    userUpdate: any,
    profileImage: string | undefined,
    userId: string,
    isProfileUpdated: boolean,
  ) {
    const userResp = {
      _id: userUpdate._id,
      authProvider: userUpdate?.authProvider,
      authProviderId: userUpdate?.authProviderId,
      status: userUpdate?.status,
      loginFlowType: userUpdate?.loginFlowType,
      firstName: userUpdate?.firstName,
      lastName: userUpdate?.lastName,
      bio: userUpdate?.bio,
    } as ProfileUpdateResponse['user'];

    // if (userUpdate?.profileImage) {
    //   const profileImageKey = `public/profiles/${userId}/${profileImage}`;
    //   if (isProfileUpdated) {
    //     await this.s3Service.copyObject(`${S3_TEMP_FOLDER_NAME}/${profileImage}`, profileImageKey);
    //     await this.userRepository.updateById(userId, { profileImage: profileImageKey });
    //   }
    //   userResp.profileImage = await this.s3Service.getPreSignedUrl(
    //     profileImageKey,
    //     SignedUrlMethod.GET,
    //   );
    //   userResp.profileImageThumbnails = await this.s3Service.getAllThumbnail(profileImageKey);
    // } else {
    //   await this.s3Service.deleteKey(`public/profiles/${userId}/${userUpdate?.profileImage}`);
    // }

    if (userUpdate?.address) {
      userResp.address = {
        displayAddress: userUpdate.address.displayAddress,
        location: {
          ...userUpdate.address.location,
          ...(userUpdate.address?.location?.coordinates && {
            coordinates: {
              long: userUpdate.address?.location?.coordinates[0],
              lat: userUpdate.address?.location?.coordinates[1],
            },
          }),
        },
      };
    }

    return userResp;
  }

  /**
   * @description request otp for update email
   * @param {string} userId
   * @param {UpdateUserEmailDto} data  update user email data
   * @returns
   */
  async updateEmail(userId: string, data: UpdateUserEmailDto): Promise<OTPResponse> {
    const { email, deviceId } = data;
    try {
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        if (String(userId) === String(existingUser._id)) {
          throw new BadRequestException(this.i18nService.t('users.cannot_update_same_email'));
        }
        throw new BadRequestException(this.i18nService.t('users.email_already_exists'));
      }
      //TODO: write the sendEmailOtp logic in separate service(eg: otp service or email service)
      const otpResponse = await this.authService.sendEmailOTP(
        { email, deviceId },
        RequestedFor.update_email,
      );

      console.log(otpResponse, 'otpResponseotpResponse');
      return {
        message: this.i18nService.t('users.verification_code_sent_to_email'),
        expiry: { expiresAt: otpResponse.expiresAt, expiresBy: otpResponse.expiresBy },
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * @description get the latest terms and conditions data
   * @returns
   */
  async getLatestTAC() {
    try {
      return await this.pageRepo.findOne(
        {
          pageType: PageType.TERMS_AND_CONDITION,
          status: PageStatus.ACTIVE,
        },
        {
          title: 1,
          slug: 1,
          version: 1,
        },
      );
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * @description accept terms and conditions
   * @param {string} userId user id
   * @returns
   */
  async acceptTermsAndConditions(userId: string) {
    try {
      const latestTAC = await this.getLatestTAC();
      if (!latestTAC)
        throw new BadRequestException(this.i18nService.t('users.terms_and_condition_not_found'));

      await this.userRepository.updateById(userId, {
        acceptedTermsVersion: latestTAC.version,
        isTermsVersionSynced: true,
      });
      return {
        message: this.i18nService.t('users.terms_and_condition_accepted'),
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * @description verify otp and update email
   * @param {string} userId
   * @param {VerifyEmailInput} data  update user email data
   * @returns
   */

  async verifyUpdateEmail(userId: string, data: VerifyEmailInput): Promise<MessageResponse> {
    const { email, verificationCode } = data;
    try {
      const otpRequest = await this.otpRequestRepo.findOne({
        email,
        verificationCode,
        requestedFor: RequestedFor.update_email,
        expiresAt: { $gte: new Date() },
      });
      if (!otpRequest) {
        throw new BadRequestException(this.i18nService.t('users.invalid_verification_code'));
      }
      const updatedUser = await this.userRepository.updateById(userId, {
        authProviderId: email,
      });
      await this.otpRequestRepo.deleteMany({
        email,
        requestedFor: RequestedFor.update_email,
      });

      if (updatedUser?.agoraUuid && updatedUser?.authProvider === 'email') {
        this.agoraHelperService.updateChatUser(userId, {
          mail: updatedUser?.authProviderId,
        });
      }
      return {
        message: this.i18nService.t('users.email_updated'),
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * @description soft delete the user and related properties
   * @param {string} userId user id
   * @returns
   */
  async deleteUserAccount(userId: string) {
    try {
      await this.userRepository.softDeleteById(userId);

      const deviceIds = await this.deviceInfoRepo.find({
        userId,
      });

      Promise.all([
        this.emailTokenRepo.softDelete({
          userId,
        }),
        this.tokenMetaRepo.softDelete({
          userId,
        }),
        this.deviceInfoRepo.softDelete({
          userId,
        }),
        this.otpRequestRepo.softDelete({
          deviceId: { $in: deviceIds.map((device) => device._id) },
        }),
      ]);
      return;
    } catch (error: any) {
      throw error;
    }
  }


}
