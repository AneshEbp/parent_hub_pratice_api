import { Injectable } from '@nestjs/common';
import { CloudFront } from 'aws-sdk';
import * as crypto from 'crypto';

export const SIGNED_URL_EXPIRES_IN = 100;

@Injectable()
export class CloudFrontService {
  private readonly cloudFront: CloudFront;
  private readonly cloudFrontDomain?: string;
  private readonly cloudFrontKeyPairId?: string;
  private readonly cloudFrontPrivateKey?: string;
  private readonly cloudFrontDistributionId?: string;
  private readonly signedUrlExpires: number;

  constructor() {
    this.signedUrlExpires = SIGNED_URL_EXPIRES_IN;
    if (
      process.env.CLOUDFRONT_DOMAIN &&
      process.env.CLOUDFRONT_KEY_PAIR_ID &&
      process.env.CLOUDFRONT_PRIVATE_KEY &&
      process.env.CLOUDFRONT_DISTRIBUTION_ID
    ) {
      this.cloudFront = new CloudFront({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION,
      });

      this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      this.cloudFrontKeyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
      this.cloudFrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
      this.cloudFrontDistributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    }
  }

  async generateSignedUrl(key: string): Promise<string> {
    const url = `https://${this.cloudFrontDomain}/${key}`;
    const expires = Math.floor((Date.now() + this.signedUrlExpires * 1000) / 1000);

    const policy = JSON.stringify({
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': expires,
            },
          },
        },
      ],
    });

    const policyEncoded = Buffer.from(policy).toString('base64');
    const signature = crypto
      .createSign('RSA-SHA1')
      .update(policy)
      .sign(this.cloudFrontPrivateKey, 'base64');

    return `${url}?Policy=${policyEncoded}&Signature=${signature}&Key-Pair-Id=${this.cloudFrontKeyPairId}`;
  }

  async getCloudFrontSignUrl(key: string): Promise<string> {
    if (!this.cloudFrontDomain) {
      throw new Error('CloudFront is not configured');
    }
    return this.generateSignedUrl(key);
  }

  async getCloudFrontUrl(key: string): Promise<string> {
    if (!this.cloudFrontDomain) {
      throw new Error('CloudFront is not configured');
    }
    return `https://${this.cloudFrontDomain}/${key}`;
  }

  async invalidateCloudFrontCache(keys: string[]) {
    const invalidationParams = {
      DistributionId: this.cloudFrontDistributionId,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: keys.length,
          Items: keys.map((key) => `/${key}`),
        },
      },
    };
    return this.cloudFront.createInvalidation(invalidationParams).promise();
  }
}
