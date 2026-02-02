import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './aws.definition';
import { AwsResolver } from './aws.resolver';
import { CloudFrontService } from './cloudfront.service';
import { S3Service } from './s3.service';

@Module({
  providers: [CloudFrontService, AwsResolver, S3Service],
  exports: [CloudFrontService, S3Service],
})
export class AwsModule extends ConfigurableModuleClass {}
