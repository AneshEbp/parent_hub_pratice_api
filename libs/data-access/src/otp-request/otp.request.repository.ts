import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTPRequest, OTPRequestDocument } from './otp.request.schema';
import { BaseRepo } from '../repository/base.repo';

@Injectable()
export class OTPRequestRepository extends BaseRepo<OTPRequestDocument> {
  constructor(
    @InjectModel(OTPRequest.name)
    private readonly otpRequestModel: Model<OTPRequestDocument>,
  ) {
    super(otpRequestModel);
  }
}
