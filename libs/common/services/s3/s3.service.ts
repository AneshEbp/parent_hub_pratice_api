import { Injectable } from '@nestjs/common';
import { S3, CloudFront } from 'aws-sdk';
import { createReadStream, existsSync, mkdirSync, rmSync } from 'fs';
import { Stream } from 'stream';
import { resolve } from 'path';
import { SignedUrlMethod } from '@app/common/enum/signed-url.enum';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

//-- this block must be same with lambda function variables --//
const ALLOWED_IMAGE_FILETYPES = [
  'png',
  'jpg',
  'jpeg',
  'bmp',
  'gif',
  'PNG',
  'JPG',
  'JPEG',
  'BMP',
  'GIF',
];

// Define the sizes for thumbnails
const fileSizes = {
  items: [
    { width: null, height: null },
    { width: 327, height: 200 },
    { width: 300, height: null },
    { width: 80, height: 80 },
    { width: 375, height: 230 },
  ],
  default: [
    { width: null, height: null },
    { width: 100, height: 200 },
    { width: 200, height: 300 },
    { width: 300, height: 400 },
  ],
};

const convertOption = {
  convertFile: true,
  convertFileExt: '.webp',
};
//-- this block must be same with lambda function variables --//

export const SIGNED_URL_EXPIRES_IN = 300;
export const S3_TEMP_FOLDER_NAME = 'temp';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly s3PublicClient: S3Client;
  private readonly cloudFront?: CloudFront;
  private readonly bucket: string;
  private readonly signedUrlExpires: number;
  private publicBucket: string;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    });

    // Initialize S3Client for AWS SDK v3
    this.s3PublicClient = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    this.bucket = process.env.S3_BUCKET_NAME;
    this.publicBucket = process.env.S3_PUBLIC_BUCKET_NAME || process.env.S3_BUCKET_NAME;
    this.signedUrlExpires = SIGNED_URL_EXPIRES_IN;
  }

  async getPreSignedUrl(
    objectKey: string,
    method: SignedUrlMethod,
    contentType?: string,
  ): Promise<string> {
    let action = 'getObject';
    const params = {
      Bucket: this.bucket,
      Key: objectKey,
      Expires: this.signedUrlExpires,
    };

    if (method === SignedUrlMethod.PUT) {
      action = 'putObject';
      const splitted = objectKey.split('/');
      const newObjectKey = splitted[splitted.length - 1];
      params['Key'] = `${S3_TEMP_FOLDER_NAME}/${newObjectKey}`;
      params['ContentType'] = contentType;
      // params['ACL'] = 'public-read';
    }

    return this.s3.getSignedUrlPromise(action, params);
  }

  async getPreSignedUrlv2(
    objectKey: string,
    method: SignedUrlMethod,
    contentType?: string,
  ): Promise<string> {
    console.log('🟣 [S3Service] getPreSignedUrl called:', {
      objectKey,
      method,
      contentType,
      bucket: this.bucket,
    });

    let action = 'getObject';
    const params = {
      Bucket: this.bucket,
      Key: objectKey,
      Expires: this.signedUrlExpires,
    };

    if (method === SignedUrlMethod.PUT) {
      action = 'putObject';
      params['ContentType'] = contentType;
      console.log('🟣 [S3Service] PUT params:', params);
    } else {
      console.log('🟣 [S3Service] GET params:', params);
    }

    try {
      const url = await this.s3.getSignedUrlPromise(action, params);
      console.log('✅ [S3Service] Presigned URL generated successfully');
      return url;
    } catch (error) {
      console.error('❌ [S3Service] Error generating presigned URL:', error);
      throw error;
    }
  }

  async getS3Url(key: string): Promise<string> {
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async deleteKey(key: string) {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(
        {
          Bucket: this.bucket,
          Key: key,
        },
        async (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        },
      );
    });
  }

  async deleteKeys(keys: string[]) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }
    return new Promise((resolve, reject) => {
      const deleteParams: any = {
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: true,
        },
      };
      this.s3.deleteObjects(deleteParams, async (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async emptyS3Directory(dir: string) {
    const listParams = {
      Bucket: this.bucket,
      Prefix: dir,
    };

    const listedObjects = await this.s3.listObjectsV2(listParams).promise();
    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
      Bucket: this.bucket,
      Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
    };

    await this.s3.deleteObjects(deleteParams).promise();
    if (listedObjects.IsTruncated) await this.emptyS3Directory(dir);
  }

  checkIfKeyExists(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.s3.headObject(
        {
          Bucket: this.bucket,
          Key: key,
        },
        (err, data) => {
          if (err) {
            resolve(false);
          } else {
            resolve(true);
          }
        },
      );
    });
  }

  async copyObject(fileName: string, newFileName: string) {
    const bucketParams = {
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${fileName}`,
      Key: newFileName,
    };

    return new Promise((resolve, reject) => {
      this.s3.copyObject(bucketParams, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async save(buffer: Buffer | Stream, fileName: string) {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: this.bucket,
        Key: fileName,
        Body: buffer,
        // ACL: 'public-read',
        ContentType: 'application/pdf',
      };
      this.s3.putObject(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  async saveLocalFile(location: string, fileName: string) {
    if (!existsSync(location)) {
      throw new Error(`${location} does not exist`);
    }
    await this.save(createReadStream(location), fileName);
  }

  getTempPath(filename: string) {
    return resolve(__dirname, '../../../../temp/', filename);
  }

  createFolderIfNotExist(folder: string) {
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }
  }

  deleteTempFolder(folder: string) {
    if (existsSync(folder)) {
      rmSync(folder, { recursive: true });
    }
  }

  async getSignedUrl(key: string) {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: this.signedUrlExpires,
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async getUrl(key: string): Promise<string> {
    return this.getS3Url(key);
  }

  async getOrginalSignedUrl(key: string) {
    return this.getSignedUrl(key);
  }

  async getConvertedOrginalSignedUrl(key: string) {
    key = key.replace(
      new RegExp(`\\.(${ALLOWED_IMAGE_FILETYPES.join('|')})$`, 'i'),
      convertOption.convertFileExt,
    );
    return this.getSignedUrl(key);
  }

  //Normal url
  async getCustomThumbnail(
    key: string,
    width: number | null = null,
    height: number | string | null = null,
  ): Promise<string> {
    if (width && !height) {
      height = 'auto';
    } else if (!width && !height) {
      width = fileSizes.default[1].width;
      height = fileSizes.default[1].height;
    }

    const size = `${width}x${height}`;
    const thumbnailKeyParts = key.split('/').slice(1);
    const fileName = thumbnailKeyParts.pop();
    thumbnailKeyParts.push(size);
    thumbnailKeyParts.push(fileName);
    const thumbnailKey = `thumbnails/${thumbnailKeyParts.join('/')}`;

    const thumbnailPath = convertOption.convertFile
      ? thumbnailKey.replace(
          new RegExp(`\\.(${ALLOWED_IMAGE_FILETYPES.join('|')})$`, 'i'),
          convertOption.convertFileExt,
        )
      : thumbnailKey;
    return this.getUrl(thumbnailPath);
  }

  //Normal url
  async getAllThumbnail(key: string, type: string | null = null) {
    const parts = key.split('/').slice(1); // Remove public part from key
    const fileName = parts.pop();
    const sizes = type === 'items' ? fileSizes.items : fileSizes.default;

    const thumbnailKeys = sizes
      .filter(({ width, height }) => width && height)
      .map(({ width, height }) => {
        const sizePath = height ? `${width}x${height}` : `${width}xauto`;
        const thumbnailPath = [...parts, sizePath, fileName].join('/');
        return `thumbnails/${thumbnailPath}`;
      });

    if (convertOption.convertFile) {
      const fileExtensionRegex = new RegExp(`.(${ALLOWED_IMAGE_FILETYPES.join('|')})$`, 'i');
      thumbnailKeys.forEach((key, index) => {
        thumbnailKeys[index] = key.replace(fileExtensionRegex, convertOption.convertFileExt);
      });
    }

    thumbnailKeys.push(key);

    return await Promise.all(thumbnailKeys.map((thumbnailKey) => this.getSignedUrl(thumbnailKey)));
  }

  async getPublicUploadUrl(objectKey: string, contentType: any, sizeInBytes: any) {
    const result = { success: true, message: null, data: null };

    try {
      result.data = await getSignedUrl(
        this.s3PublicClient,
        new PutObjectCommand({
          Bucket: this.publicBucket,
          Key: objectKey,
          ...(contentType ? { ContentType: contentType } : {}),
          ...(sizeInBytes ? { ContentLength: sizeInBytes } : {}),
        }),
      );
    } catch (error) {
      result.success = false;
      result.message = error.message;
    }

    return result;
  }
}
