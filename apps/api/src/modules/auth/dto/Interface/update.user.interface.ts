import { LocationType } from '@app/common/enum/location-type.enum';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @interface UpdateProfilInterface
 * @typedef {UpdateProfilInterface}
 */
export interface UpdateProfilInterface {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  firstName?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  lastName?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  authProviderId?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  bio?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  profileImage?: string;
  /**
   * ${1:Description placeholder}
   *
   * @type {?{
   *     displayAddress: string;
   *     location: {
   *       type: LocationType;
   *       coordinates?: [number, number];
   *       country?: string;
   *       state?: string;
   *       city?: string;
   *       street?: string;
   *       postalCode?: number;
   *     };
   *   \}\}
   */
  address?: {
    displayAddress: string;
    location: {
      type: LocationType;
      coordinates?: [number, number];
      country?: string;
      state?: string;
      city?: string;
      street?: string;
      postalCode?: number;
    };
  };
}
