import { Field, InputType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';
import { LocationType } from '@app/common/enum/location-type.enum';

@InputType()
export class CoordinatesInput {
  @Field()
  @Min(-90)
  @Max(90)
  lat: number;
  @Field()
  @Min(-180)
  @Max(180)
  long: number;
}
@InputType()
export class AddressInput {
  @Field(() => LocationType, {
    nullable: true,
  })
  type: LocationType;
  @Field()
  displayAddress: string;
  @Field({ nullable: true })
  coordinates: CoordinatesInput;
  @Field({ nullable: true })
  country: string;
  @Field({ nullable: true })
  state: string;
  @Field({ nullable: true })
  city: string;
  @Field({ nullable: true })
  street: string;
  @Field({ nullable: true })
  postalCode: number;
}
