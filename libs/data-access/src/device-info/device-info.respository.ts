import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepo } from '../repository/base.repo';
import { DeviceInfo, DeviceInfoDocument } from './device-info.schema';
import { Model } from 'mongoose';

@Injectable()
export class DeviceInfoRepository extends BaseRepo<DeviceInfoDocument> {
  constructor(
    @InjectModel(DeviceInfo.name)
    private readonly deviceInfoModel: Model<DeviceInfoDocument>,
  ) {
    super(deviceInfoModel);
  }
}
