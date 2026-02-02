import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { BaseRepo } from './../repository/base.repo';
import { Role, RoleDocument } from './role.schema';

@Injectable()
export class RoleRepository extends BaseRepo<RoleDocument> {
  constructor(
    @InjectModel(Role.name)
    private readonly role: Model<RoleDocument>,
  ) {
    super(role);
  }

  async getAllRoles(filter) {
    return this.role.find(filter);
  }

  async bulkUpdateRolePermission(bulkOperations: any): Promise<any> {
    return await this.role.bulkWrite(bulkOperations);
  }
}
