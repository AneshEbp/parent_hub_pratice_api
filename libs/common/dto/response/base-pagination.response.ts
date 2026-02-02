import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BasePaginationResponse {
  @Field()
  total: number;

  @Field()
  hasNextPage: boolean;
}
