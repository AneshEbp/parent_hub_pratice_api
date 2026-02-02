import { BadRequestException, HttpException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CloudFrontService } from './cloudfront.service';
import { MessageResponse } from '@app/common/dto/response/message.response';
import {
  AllThumbnailInput,
  GetUploadUrlDTO,
  PreSignedUrlInput,
  ThumbnailInput,
} from './dto/input/upload-profile-image.dto';
import {
  GetUploadUrlFromKeyResponse,
  PreSignedUrlResponse,
  UploadUrlResponse,
} from './dto/response/presignedurl-response';
import { S3Service } from './s3.service';
import { HttpStatusCode } from 'axios';
import { SignedUrlMethod } from '@app/common/enum/signed-url.enum';

/**
 * Description placeholder
 *
 * @export
 * @class AwsResolver
 * @typedef {AwsResolver}
 */
@Resolver()
export class AwsResolver {
  /**
   * Creates an instance of AwsResolver.
   *
   * @constructor
   * @param {CloudFrontService} cloudFrontService
   * @param {S3Service} s3Service
   */
  constructor(
    private readonly cloudFrontService: CloudFrontService,
    private readonly s3Service: S3Service,
  ) {}

  /*
  @desc     Get presigned url
  @access   Private
  @res      url 
   */
  /**
   * ${1:Description placeholder}
   *
   * @async
   * @param {PreSignedUrlInput} input
   * @returns {Promise<{ message: string; url: any; }>}
   */
  @Query(() => PreSignedUrlResponse, { name: 'getPreSignedUrl' })
  async getPreSignedUrl(@Args('input') input: PreSignedUrlInput): Promise<{
    message: string;
    url: string;
  }> {
    const { method, path, contentType } = input;
    try {
      if (method === 'PUT' && !contentType) {
        throw new BadRequestException('Content type is required for PUT request');
      }
      const url = await this.s3Service.getPreSignedUrl(path, method, contentType);
      return {
        message: 'PreSigned url get successful',
        url,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Query(() => PreSignedUrlResponse, { name: 'getCustomThumbnail' })
  /**
   * ${1:Get thumbnail with custom size. If width or height is not provided, default size will be used}
   *
   * @async
   * @param {ThumbnailInput} input
   * @returns {Promise<{ message: string; url: any; }>}
   */
  async getCustomThumbnail(@Args('input') input: ThumbnailInput) {
    const { key, width, height } = input;
    try {
      const url = await this.s3Service.getCustomThumbnail(key, width, height);
      return {
        message: 'Url get successful',
        url,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Query(() => PreSignedUrlResponse, { name: 'getAllThumbnail' })
  /**
   * ${1:Get all thumbnail sizes for given key.}
   *
   * @async
   * @param {AllThumbnailInput} input
   * @returns {Promise<{ message: string; urls: any[]; }>}
   */
  async getAllThumbnail(@Args('input') input: AllThumbnailInput): Promise<{
    message: string;
    urls: string[];
  }> {
    const { key, type } = input;
    try {
      const urls = await this.s3Service.getAllThumbnail(key, type);
      return {
        message: 'Url get successful',
        urls,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get CloudFront Signed URL
   *
   * @async
   * @param {string} key
   * @returns {unknown}
   */
  @Query(() => String, { name: 'getCloudFrontSignUrl' })
  async getCloudFrontSignUrl(@Args('key') key: string): Promise<string> {
    try {
      if (this.cloudFrontService) {
        return await this.cloudFrontService.getCloudFrontSignUrl(key);
      } else {
        throw new BadRequestException('CloudFront service is not available');
      }
    } catch (error) {
      throw new BadRequestException('Error generating CloudFront URL');
    }
  }

  /**
   * Get CloudFront URL
   *
   * @async
   * @param {string} key
   * @returns {unknown}
   */
  @Query(() => String, { name: 'getCloudFrontUrl' })
  async getCloudFrontUrl(@Args('key') key: string): Promise<string> {
    try {
      if (this.cloudFrontService) {
        return await this.cloudFrontService.getCloudFrontUrl(key);
      } else {
        throw new BadRequestException('CloudFront service is not available');
      }
    } catch (error) {
      throw new BadRequestException('Error generating CloudFront URL');
    }
  }

  /**
   * CloudFront URL Invalidation
   *
   * @async
   * @param {string[]} keys
   * @returns {unknown}
   */
  @Mutation(() => MessageResponse, { name: 'invalidateCloudFrontCache' })
  async invalidateCloudFrontCache(@Args('keys', { type: () => [String] }) keys: string[]): Promise<{
    message: string;
  }> {
    try {
      if (this.cloudFrontService) {
        await this.cloudFrontService.invalidateCloudFrontCache(keys);
        return { message: 'Link invalidated' };
      } else {
        throw new BadRequestException('CloudFront service is not available');
      }
    } catch (error) {
      throw new BadRequestException('Error invalidating CloudFront URL');
    }
  }

  @Mutation(() => GetUploadUrlFromKeyResponse)
  async getPublicUploadUrl(@Args('input') { key, contentType, sizeInBytes }: GetUploadUrlDTO) {
    const result = await this.s3Service.getPublicUploadUrl(key, contentType, sizeInBytes);

    if (result.success) {
      return { url: result.data };
    } else {
      throw new HttpException(result.message, HttpStatusCode.BadRequest);
    }
  }

  @Query(() => UploadUrlResponse)
  async getUploadAndFetchUrl(
    @Args('key') key: string,
    @Args('contentType') contentType: string,
  ): Promise<UploadUrlResponse> {
    console.log('🔴 [Backend] getUploadUrl called:', { key, contentType });

    try {
      // Get presigned URL for upload (PUT)
      const uploadUrl = await this.s3Service.getPreSignedUrlv2(
        key,
        SignedUrlMethod.PUT,
        contentType,
      );
      console.log('🔴 [Backend] Upload URL generated:', uploadUrl?.substring(0, 100) + '...');

      // Get presigned URL for fetch (GET) - same key!
      const fetchUrl = await this.s3Service.getPreSignedUrlv2(key, SignedUrlMethod.GET);
      console.log('🔴 [Backend] Fetch URL generated:', fetchUrl?.substring(0, 100) + '...');

      const result = {
        key,
        uploadUrl,
        fetchUrl,
      };

      console.log('✅ [Backend] Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ [Backend] Error in getUploadUrl:', error);
      throw error;
    }
  }
}
