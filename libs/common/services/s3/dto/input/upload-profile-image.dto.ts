import { S3KeyDTO } from '@app/common/dto/input/s3-key.dto';
import { SignedUrlMethod } from '@app/common/enum/signed-url.enum';
import { Field, InputType } from '@nestjs/graphql';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class PreSignedUrlInput
 * @typedef {PreSignedUrlInput}
 */
@InputType()
export class PreSignedUrlInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  path?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {SignedUrlMethod}
   */
  @Field(() => SignedUrlMethod)
  method: SignedUrlMethod;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  contentType?: string;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class PreSignedUrlInput
 * @typedef {PreSignedUrlInput}
 */
@InputType()
export class AllThumbnailInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field()
  key: string;

  @Field({ nullable: true })
  type?: string;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class PreSignedUrlInput
 * @typedef {PreSignedUrlInput}
 */
@InputType()
export class ThumbnailInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field()
  key: string;

  @Field({ nullable: true })
  width?: number;

  @Field({ nullable: true })
  height?: number;
}

@InputType()
export class GetUploadUrlDTO extends S3KeyDTO {
  @Field({ nullable: true })
  contentType: string;

  @Field({ nullable: true })
  sizeInBytes: number;
}
