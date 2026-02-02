import { Field, ObjectType } from '@nestjs/graphql';
import { BasePaginationResponse } from './base-pagination.response';

@ObjectType()
export class BaseResponse {
  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  pagination?: BasePaginationResponse;
}
