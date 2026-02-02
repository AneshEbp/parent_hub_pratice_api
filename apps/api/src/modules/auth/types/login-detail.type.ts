/**
 * ${1:Description placeholder}
 *
 * @export
 * @typedef {LoginDetailType}
 */
export type LoginDetailType = {
  jti: string;
  userId: string;
  tokenType: string;
  grant: string;
  deviceId?: string;
  businessId?: string;
};
