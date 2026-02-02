import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationResponse {
  @Field()
  total: number;

  @Field()
  hasNextPage: boolean;
}
