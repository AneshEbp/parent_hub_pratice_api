import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfilePictureType {
  @Field({ nullable: true })
  original: string;

  @Field({ nullable: true })
  small: string;

  @Field({ nullable: true })
  medium: string;
}

@ObjectType()
export class AppointmentTypeObject {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  appointmentTypeId: string;

  @Field({ nullable: true })
  appointmentCategoryTitle: string;

  @Field({ nullable: true })
  appointmentCategoryId: string;

  @Field({ nullable: true })
  color: string;
}

@ObjectType()
export class PractitionerType {
  @Field({ nullable: true })
  userId: string;

  @Field({ nullable: true })
  fullName: string;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  profilePicture: string;

  @Field(() => ProfilePictureType, { nullable: true })
  profilePictureUrls: ProfilePictureType;

  @Field(() => [String], { nullable: true })
  scheduleLocations: string[];
}
