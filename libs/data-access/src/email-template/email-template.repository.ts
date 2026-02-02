import { InjectModel } from '@nestjs/mongoose';
import { EmailTemplate, EmailTemplateDocument } from './email-template.schema';
import { BaseRepo } from './../repository/base.repo';
import { Model } from 'mongoose';
import { paginationOptions } from '../repository/pagination.type';

export class EmailTemplateRepository extends BaseRepo<EmailTemplateDocument> {
  projection;
  constructor(
    @InjectModel(EmailTemplate.name) private readonly model: Model<EmailTemplateDocument>,
  ) {
    super(model);
  }

  async getAllTemplates(filter: any, pageMeta: paginationOptions) {
    this.projection = {
      _id: 1,
      title: 1,
      slug: 1,
      subject: 1,
      status: 1,
      body: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    return this.findWithPaginate(filter, pageMeta, this.projection);
  }
}
