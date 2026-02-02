import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BaseEntityResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
