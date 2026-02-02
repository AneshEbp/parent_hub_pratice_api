import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PagMetaDTO {
  @Field()
  skip: number;

  @Field()
  limit: number;
}
