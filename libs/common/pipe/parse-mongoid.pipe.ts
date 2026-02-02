import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as mongoose from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    if (!mongoose.isValidObjectId(value)) {
      throw new BadRequestException('Invalid object id!');
    }
    return new mongoose.Types.ObjectId(value);
  }
}
