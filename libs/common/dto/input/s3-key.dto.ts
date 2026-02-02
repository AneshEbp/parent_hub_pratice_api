import messages from '@api/constants/language';
import { s3FileUploadExtensionRegExp } from '@cms-api/constants/regex';
import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, Matches } from 'class-validator';

@InputType()
export class S3KeyDTO {
  @Field()
  @IsString()
  @IsNotEmpty({ message: messages.REQUIRED_FILE_KEY })
  @Matches(s3FileUploadExtensionRegExp.regex, {
    message: s3FileUploadExtensionRegExp.message,
  })
  key: string;
}
