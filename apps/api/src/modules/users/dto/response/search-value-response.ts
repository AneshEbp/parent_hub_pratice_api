import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationResponse {
  @Field()
  total: number;

  @Field()
  hasNextPage: boolean;
}

@ObjectType()
export class SearchValueUserType {
  @Field(() => ID)
  _id: string;

  @Field(() => String, { nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  lastName: string;

  @Field(() => String, { nullable: true })
  profilePicture: string;

  @Field(() => String, { nullable: true })
  role?: string;

  @Field(() => String, { nullable: true })
  concessionId?: string;

  @Field(() => String, { nullable: true })
  concessionName?: string;

  @Field(() => String, { nullable: true })
  preferredName: string;

  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => String, { nullable: true })
  fullNameWithDateOfBirth: string;

  @Field(() => String, { nullable: true })
  additionalInformation: string;

  @Field(() => Boolean, { nullable: true })
  isDependent: boolean;

  @Field(() => [String], { nullable: true })
  locationIds?: string[];

  @Field(() => [String], { nullable: true })
  classTypeIds?: string[];

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  teamMemberTitle?: string;
}

@ObjectType()
export class SearchValueForUsersResponse {
  @Field(() => [SearchValueUserType])
  users: SearchValueUserType[];

  @Field()
  pagination: PaginationResponse;
}
