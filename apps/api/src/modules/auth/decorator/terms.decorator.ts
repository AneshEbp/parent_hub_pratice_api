import { SetMetadata } from '@nestjs/common';

/**
 * ${1:Description placeholder}
 *
 * @returns {*}
 */
export const SkipTermsAcceptanceCheck = () =>
  SetMetadata('skipTermsAcceptanceCheck', true);
