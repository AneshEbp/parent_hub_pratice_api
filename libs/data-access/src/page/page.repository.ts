import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepo } from './../repository/base.repo';
import { Page, PageDocument } from './page.schema';
import { paginationOptions } from '../repository/pagination.type';

@Injectable()
export class PageRepository extends BaseRepo<PageDocument> {
  projection;
  constructor(
    @InjectModel(Page.name)
    private readonly pageModel: Model<PageDocument>,
  ) {
    super(pageModel);
    /* build projection */
    this.projection = {
      _id: 1,
      title: 1,
      seoTags: 1,
      pageType: 1,
      slug: 1,
      content: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    };
  }

  async getAllPages(filter, pageMeta: paginationOptions) {
    /* create pipeline */
    return this.findWithPaginate(filter, pageMeta, this.projection);
  }
}
