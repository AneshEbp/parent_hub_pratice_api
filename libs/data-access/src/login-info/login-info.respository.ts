import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepo } from '../repository/base.repo';
import { LoginInfo, LoginInfoDocument } from './login-info.schema';
import { Model } from 'mongoose';

@Injectable()
export class LoginInfoRepository extends BaseRepo<LoginInfoDocument> {
  constructor(
    @InjectModel(LoginInfo.name)
    private readonly loginInfoModel: Model<LoginInfoDocument>,
  ) {
    super(loginInfoModel);
  }
}
