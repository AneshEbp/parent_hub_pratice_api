import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepo } from './../repository/base.repo';
import { Permission, PermissionDocument } from './permission.schema';

@Injectable()
export class PermissionRepository extends BaseRepo<PermissionDocument> {
  constructor(
    @InjectModel(Permission.name)
    private readonly permission: Model<PermissionDocument>,
  ) {
    super(permission);
  }

  async getAllPermissions(filter) {
    return await this.find(filter);
  }
}
