import { toMongoId } from './mongo-helper';
import * as crypto from 'crypto';

export const convertStringIdToObjectId = (id) => {
  try {
    return toMongoId(id);
  } catch (err) {
    return { exception: err };
  }
};

// export const randomString = (length) => {
//   let result = '';
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

export const randomString = (length) => {
  // Generate random bytes, convert them to a hex string, and slice it to the desired length
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const generateSMSCode = () => {
  if (
    process.env.APP_ENV === 'development' ||
    process.env.APP_ENV === 'local' ||
    process.env.APP_ENV === 'test'
  ) {
    return 123456;
  }

  // Note: uncomment if want to change
  // return 123456;
  // return Math.floor(1000 + Math.random() * 9000); return 4 digit
  // return 6 digit
  // return Math.floor(100000 + Math.random() * 900000);
  const otp = (crypto.randomBytes(3).readUInt32BE(0) % 900000) + 100000; // 6-digit OTP
  return otp;
};

export const isAllowedExt = (filename: string, extensions: string[]) => {
  const ext = filename.substring(filename.lastIndexOf('.') + 1);
  if (!extensions.length) return true;
  if (!ext || !extensions.includes(ext.toLowerCase())) return false;
  return true;
};

/**
 * gets the date before or after the given `days` from the specified date
 * @param {Date} fromDate date from which the calculation has to be done
 * @param {number} days number of days to calculate before or after
 * @param {'before' | 'after'} getType before or after
 * @returns {Date}
 */
export const getDynamicDate = (fromDate: Date, days: number, getType: 'before' | 'after'): Date => {
  const sign: any = getType === 'before' ? '-' : '+';
  const result = fromDate.setDate(fromDate.getDate() + Number(`${sign}${days}`));
  return new Date(result);
};

//Return true if DOB is less then today date
export const isValidDob = (birthDate: string) => {
  const birthDateObj = new Date(birthDate);
  const currentDate = new Date();

  if (birthDateObj < currentDate) {
    return true;
  }
  return false;
};

export const isUserAbove18Year = (birthDate: string) => {
  const birthDateObj = new Date(birthDate);
  const currentDate = new Date();

  // Calculate the date 18 years ago from today
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);

  // Check if the birth date is before today and at least 18 years old
  if (birthDateObj < currentDate && birthDateObj <= eighteenYearsAgo) {
    return true;
  }
  return false;
};

export const isNullOrUndefined = (val) => val === null || val === undefined;

export const generateSearchRegex = (searchText: string) => {
  const searchWords = searchText.split(/\s+/).filter((word) => word.length > 0);
  // Construct a regex pattern that ensures all words are present in the fullName
  return searchWords.map((word) => `(?=.*${word})`).join('') + '.*';
};

export const generateCacheKey = (fieldName: string, args: any = {}): string => {
  return `graphql:${fieldName}:${JSON.stringify(args)}`;
};
