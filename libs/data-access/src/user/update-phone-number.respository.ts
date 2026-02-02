import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepo } from './../repository/base.repo';
import { UpdatePhoneNumber, UpdatePhoneNumberDocument } from './update-phone.schema';

@Injectable()
export class UpdatePhoneNumberRepository extends BaseRepo<UpdatePhoneNumberDocument> {
  constructor(
    @InjectModel(UpdatePhoneNumber.name)
    private readonly updatePhoneNumberModel: Model<UpdatePhoneNumberDocument>,
  ) {
    super(updatePhoneNumberModel);
  }
}
