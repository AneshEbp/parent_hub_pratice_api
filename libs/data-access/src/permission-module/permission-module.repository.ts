import { InjectModel } from '@nestjs/mongoose';
import { BaseRepo } from '../repository/base.repo';
import { PermissionModule, PermissionModuleDocument } from './permission-module.schema';
import { Model } from 'mongoose';

export class PermissionModuleRepository extends BaseRepo<PermissionModuleDocument> {
  constructor(
    @InjectModel(PermissionModule.name)
    private readonly permissionModuleModel: Model<PermissionModuleDocument>,
  ) {
    super(permissionModuleModel);
  }
}
