import { Field, ObjectType } from '@nestjs/graphql';
import { LocationType } from '@app/common/enum/location-type.enum';
/**
 * ${1:Description placeholder}
 *
 * @class CoordinatesResponse
 * @typedef {CoordinatesResponse}
 */
@ObjectType()
class CoordinatesResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {number}
   */
  @Field({ nullable: true })
  lat: number;
  /**
   * ${1:Description placeholder}
   *
   * @type {number}
   */
  @Field({ nullable: true })
  long: number;
}
/**
 * ${1:Description placeholder}
 *
 * @export
 * @class LocationResponse
 * @typedef {LocationResponse}
 */
@ObjectType()
export class LocationResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {LocationType}
   */
  @Field(() => LocationType, { nullable: true })
  type: LocationType;
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field({ nullable: true })
  displayAddress: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?CoordinatesResponse}
   */
  @Field({ nullable: true })
  coordinates?: CoordinatesResponse;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  country?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  state?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  city?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true })
  street?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  @Field({ nullable: true })
  postalCode?: number;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class AddressResponse
 * @typedef {AddressResponse}
 */
@ObjectType()
export class AddressResponse {
  /**
   * ${1:Description placeholder}
   *
   * @type {string}
   */
  @Field()
  displayAddress: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {LocationResponse}
   */
  @Field()
  location: LocationResponse;
}
