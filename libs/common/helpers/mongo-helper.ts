import { BadRequestException } from '@nestjs/common';
import * as mongoose from 'mongoose';

/**
 * Helper function for transform validator
 * @param param - The object with id value on string format
 * @returns {ObjectId} - The objectId on mongodb ObjectId  format
 */
export const toMongoObjectId = (param: { value: string; key: string }) => {
  const { value, key } = param;
  if (!mongoose.isValidObjectId(value)) {
    throw new BadRequestException(`Invalid ${key} value`);
  }
  return new mongoose.Types.ObjectId(value);
};

/**
 *
 * @param id - The objectId on string format
 * @returns {string} - The objectId on mongodb ObjectId  format
 */
export const toMongoId = (id: string) => {
  return new mongoose.Types.ObjectId(id);
};
