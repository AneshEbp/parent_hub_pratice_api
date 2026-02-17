import { Resolver, Args, Query, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthUserGuard } from '@api/guards/auth.user.guard';
import { LoginDetail } from '../auth/decorator/login.decorator';
import { LoginDetailType } from '../auth/types/login-detail.type';
import { UsersService } from './users.service';
import { ProfileUpdateResponse } from './dto/response/profile-update.response';
import { UpdateUserProfile } from '../auth/dto/input/update-user-profile';
import { OTPResponse } from '../auth/dto/response/otp.response';
import { UpdateUserEmailDto } from './dto/input/update-email.input';
import { VerifyEmailInput } from '../auth/dto/input/verify-email.input';
import { MessageResponse } from '@app/common/dto/response/message.response';
import {
  UserProfileResponse,
  UserResponse,
} from '@api/common/dto/user.response';
import { ParseObjectIdPipe } from '@app/common/pipe/parse-mongoid.pipe';
import { ListUseProfilesDTO } from './dto/input/list-user.dto';
import {
  UserDetailsResponse,
  UserProfilesListResponse,
} from './dto/response/user-list.response';
import { TermsGuard } from '@api/guards/terms.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SkipTermsAcceptanceCheck } from '../auth/decorator/terms.decorator';
import { LoggingInterceptor } from '@app/common/interceptors/logging.interceptor';
import { UpdateAgoraUserInput } from './dto/input/agora-updates';

/**
 * Resolver for user-related operations, including profile management,
 * account deletion, and email updates. This class defines GraphQL
 * mutations and queries for managing user accounts and retrieving user
 * profiles.
 *
 * @export
 * @class UsersResolver
 * @typedef {UsersResolver}
 */
@Resolver(() => UserDetailsResponse)
@UseGuards(AuthUserGuard)
@UseInterceptors(LoggingInterceptor)
export class UsersResolver {
  /**
   * Creates an instance of UsersResolver.
   *
   * @constructor
   * @param {UsersService} usersService - Service for user-related operations.
   * @param {S3Service} s3Service - (Optional) Service for handling S3 operations.
   */
  constructor(
    private readonly usersService: UsersService,
    // private readonly s3Service: S3Service,
  ) {}

  /**
   * Deletes the user account for the authenticated user.
   * Returns a message indicating success.
   *
   * @async
   * @param {LoginDetailType} user - The logged-in user's details.
   * @param {I18nContext} i18n - The i18n context for translation.
   * @returns {Promise<MessageResponse>} A message indicating the account deletion status.
   */
  @Mutation(() => MessageResponse)
  async deleteAccount(
    @LoginDetail() user: LoginDetailType,
    @I18n() i18n: I18nContext,
  ): Promise<MessageResponse> {
    await this.usersService.deleteUserAccount(user?.userId);
    return {
      message: i18n.t('users.user_delete'),
    };
  }

  /**
   * Updates the user's profile information.
   *
   * @async
   * @param {any} loginDetail - The details of the logged-in user.
   * @param {UpdateUserProfile} body - The new profile data to update.
   * @returns {Promise<ProfileUpdateResponse>} The updated profile response.
   */
  @Mutation(() => ProfileUpdateResponse)
  // @CsrfQL('csrf-token token is missing in header.')
  @SkipTermsAcceptanceCheck()
  async updateProfile(
    @LoginDetail() loginDetail: any,
    @Args('body') body: UpdateUserProfile,
  ): Promise<ProfileUpdateResponse> {
    return this.usersService.updateProfile(loginDetail.userId, body);
  }

  @Query((returns) => String, { name: 'getCsrfToken', nullable: false })
  async generateCsrfToken(@Context('req') req: any) {
    return req?.csrfToken();
  }

  /**
   * Initiates the email update process for the authenticated user.
   * Returns an OTP response for verifying the new email.
   *
   * @async
   * @param {any} loginDetail - The details of the logged-in user.
   * @param {UpdateUserEmailDto} body - The new email data to update.
   * @returns {Promise<OTPResponse>} The OTP response for email verification.
   */
  @Mutation(() => OTPResponse)
  async updateEmail(
    @LoginDetail() loginDetail: any,
    @Args('body') body: UpdateUserEmailDto,
  ): Promise<OTPResponse> {
    return this.usersService.updateEmail(loginDetail.userId, body);
  }

  /**
   * Accepts the terms and conditions for the authenticated user.
   * Returns a message indicating success.
   *
   * @async
   * @param {LoginDetailType} loginDetail - The details of the logged-in user.
   * @returns {Promise<{ message: string; }>} A message indicating acceptance status.
   */
  @Mutation(() => MessageResponse)
  @SkipTermsAcceptanceCheck()
  async acceptTermsAndConditions(
    @LoginDetail() loginDetail: LoginDetailType,
  ): Promise<{ message: string }> {
    return this.usersService.acceptTermsAndConditions(loginDetail.userId);
  }

  /**
   * Verifies the updated email address for the authenticated user.
   *
   * @async
   * @param {any} loginDetail - The details of the logged-in user.
   * @param {VerifyEmailInput} body - The verification data for the updated email.
   * @returns {Promise<MessageResponse>} A message indicating the verification status.
   */
  @Mutation(() => MessageResponse)
  async verifyUpdateEmail(
    @LoginDetail() loginDetail: any,
    @Args('body') body: VerifyEmailInput,
  ): Promise<MessageResponse> {
    return this.usersService.verifyUpdateEmail(loginDetail.userId, body);
  }

  @Mutation(()=>Boolean)
  async updateAgoraUser(
    @LoginDetail() loginDetail: any,
    @Args('body') body: UpdateAgoraUserInput,
  ) {
    const result = await this.usersService.updateAgoraUsers(
      body,
      loginDetail.userId,
    );
    console.log(result)
    return true
  }

  /**
   * Retrieves the profile of the authenticated user.
   *
   * @async
   * @param {LoginDetailType} loginDetail - The details of the logged-in user.
   * @returns {Promise<UserResponse>} The user's profile response.
   */
  @Query(() => UserResponse)
  @UseInterceptors(LoggingInterceptor)
  @SkipTermsAcceptanceCheck()
  async me(@LoginDetail() loginDetail: LoginDetailType): Promise<UserResponse> {
    return this.usersService.me(loginDetail?.userId);
  }

  /**
   * Retrieves a specific user's profile by their user ID.
   *
   * @async
   * @param {string} userId - The ID of the user whose profile is to be retrieved.
   * @returns {Promise<UserProfileResponse>} The requested user's profile response.
   */
  @Query(() => UserProfileResponse)
  async getAppUserProfile(
    @Args('userId', new ParseObjectIdPipe()) userId: string,
  ): Promise<UserResponse> {
    return this.usersService.findById(userId, {
      firstName: 1,
      lastName: 1,
      profileImage: 1,
      bio: 1,
    });
  }

  /**
   * Lists user profiles based on input criteria.
   *
   * @async
   * @param {LoginDetailType} loginDetail - The details of the logged-in user.
   * @param {ListUseProfilesDTO} input - The input criteria for listing user profiles.
   * @returns {Promise<{ message: string; users: any; pagination: any; }>} The list of user profiles with pagination info.
   */
  @Query(() => UserProfilesListResponse)
  async listUserProfiles(
    @LoginDetail() loginDetail: LoginDetailType,
    @Args('input') input: ListUseProfilesDTO,
  ): Promise<{
    message: string;
    users: any;
    pagination: {
      total: any;
      hasNextPage: boolean;
    };
  }> {
    return this.usersService.findUserProfiles(input, loginDetail.userId);
  }
}
