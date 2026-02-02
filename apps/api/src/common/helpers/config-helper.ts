/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ConfigVariableService
 * @typedef {ConfigVariableService}
 */
export class ConfigVariableService {
  /**
   * ${1:Description placeholder}
   *
   * @returns {{ accessTokenSecret: any; accessTokenExpiryMs: any; refreshTokenSecret: any; refreshTokenExpiryMs: any; }\}
   */
  static readonly jwtTokenConfig = () => {
    return {
      accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
      accessTokenExpiryMs: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN,
      refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
      refreshTokenExpiryMs: process.env.JWT_REFRESH_TOKEN_EXPIRE_IN,
    };
  };
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class ConfigBiometricVariableService
 * @typedef {ConfigBiometricVariableService}
 */
export class ConfigBiometricVariableService {
  /**
   * ${1:Description placeholder}
   *
   * @returns {{ biometricTokenSecret: any; biometricTokenExpiryMs: any; }\}
   */
  static readonly jwtTokenConfig = () => {
    return {
      biometricTokenSecret: process.env.JWT_BIOMETRIC_TOKEN_SECRET,
      biometricTokenExpiryMs: process.env.JWT_BIOMETRIC_TOKEN_EXPIRE_IN,
    };
  };
}
