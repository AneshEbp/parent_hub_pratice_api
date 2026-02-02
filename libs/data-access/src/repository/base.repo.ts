import { Injectable } from '@nestjs/common';
import {
  AnyKeys,
  ClientSession,
  Document,
  FilterQuery,
  Model,
  MongooseUpdateQueryOptions,
  ObjectId,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';
import { Order } from './pagination.enum';

@Injectable()
export class BaseRepo<T extends Document> {
  private readonly _model: Model<T>;
  constructor(_model: Model<T>) {
    this._model = _model;
  }

  private getSoftDeleteFilter(): FilterQuery<T> {
    return {
      $and: [
        { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
        { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
      ],
    };
  }

  async create(doc: AnyKeys<T> | T, session: ClientSession | null = null): Promise<T> {
    return session
      ? await this._model.create([doc], { session }).then((res) => res[0])
      : await this._model.create(doc);
  }
  async createMany(doc: any, session: ClientSession | null = null): Promise<any> {
    return session
      ? await this._model.insertMany(doc, { session })
      : await this._model.insertMany(doc);
  }

  async findOne(
    filter?: FilterQuery<T>,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<T | null> {
    return this._model.findOne({ ...filter, ...this.getSoftDeleteFilter() }, projection, options);
  }

  async findById(
    id: string,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions<T> | null,
  ): Promise<T | null> {
    return this._model.findOne({ _id: id, ...this.getSoftDeleteFilter() }, projection, options);
  }

  async find(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T> | null | undefined,
  ): Promise<T[]> {
    return this._model.find({ ...filter, ...this.getSoftDeleteFilter() }, projection, options);
  }

  async updateOne(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: UpdateQuery<T> | MongooseUpdateQueryOptions<T> | null,
  ) {
    return this._model.updateOne(filter, update, options);
  }

  async findOneAndUpdate(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: UpdateQuery<T> | MongooseUpdateQueryOptions<T> | null,
  ): Promise<T | null> {
    return this._model.findOneAndUpdate(filter, update, options);
  }

  async updateMany(
    filter?: FilterQuery<T>,
    update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: UpdateQuery<T> | MongooseUpdateQueryOptions<T>,
  ) {
    return this._model.updateMany(filter, update, options);
  }

  async updateById(
    id: ObjectId | string,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options: QueryOptions<T> = {},
    session: ClientSession | null = null,
  ): Promise<T | null> {
    return session
      ? this._model.findByIdAndUpdate(id, update, options).session(session)
      : this._model.findByIdAndUpdate(id, update, options);
  }

  async deleteOne(filter?: FilterQuery<T>, options?: MongooseUpdateQueryOptions<T>): Promise<any> {
    return this._model.deleteOne(filter, options);
  }

  async deleteById(id: ObjectId | string, options?: QueryOptions<T>): Promise<T | null> {
    return this._model.findByIdAndDelete(id, options);
  }

  async deleteMany(
    filter?: FilterQuery<T>,
    options?: UpdateQuery<T> | MongooseUpdateQueryOptions<T>,
    session: ClientSession | null = null,
  ): Promise<any> {
    // Merge session into options if provided
    const opts = session ? { ...(options ?? {}), session } : options;

    return this._model.deleteMany(filter, opts);
  }

  async findWithPaginate(
    filters: FilterQuery<T>,
    paginationOptions: { skip: number; limit: number; orderBy?: string; order?: string },
    projection?: ProjectionType<T> | null,
  ) {
    const { skip, limit, orderBy, order } = paginationOptions;

    const sort: any = {};
    if (orderBy && order) sort[orderBy] = order === Order.ASC ? 1 : -1;

    filters = { ...filters, ...this.getSoftDeleteFilter() };

    const query = this._model.find(filters, projection);

    if (sort) query.sort(sort);

    query.skip(skip).limit(limit);

    const result = await query;

    const total = await this._model.countDocuments(filters);

    return {
      data: result,
      pagination: {
        total,
        hasNextPage: total > skip + limit,
      },
    };
  }

  async aggregate(stages: PipelineStage[]): Promise<any[]> {
    return this._model.aggregate([{ $match: this.getSoftDeleteFilter() }, ...stages]);
  }

  async aggregatePaginate(
    stages: PipelineStage[],
    { skip, limit }: { skip: number; limit: number },
  ) {
    const baseStages = [{ $match: this.getSoftDeleteFilter() }, ...stages];
    const data = await this._model.aggregate([...baseStages, { $skip: skip }, { $limit: limit }]);
    const total = await this.totalAggregate(baseStages);

    return {
      data,
      pagination: {
        total,
        hasNextPage: total > skip + limit,
      },
    };
  }

  // Note: Old code may need in feature
  // async aggregate(stages: PipelineStage[]): Promise<any[]> {
  //   return this._model.aggregate(stages);
  // }
  // async aggregatePaginate(
  //   stages: PipelineStage[],
  //   paginationOptions: { skip: number; limit: number },
  // ) {
  //   const { skip, limit } = paginationOptions;
  //   const facetData: any = [{ $skip: skip }, { $limit: limit }];
  //   stages.push({
  //     $facet: {
  //       pagination: [{ $count: 'total' }],
  //       data: facetData,
  //     },
  //   });
  //   const aggregationResult = await this._model.aggregate(stages);
  //   const total = aggregationResult[0].pagination[0] ? aggregationResult[0].pagination[0].total : 0;
  //   const hasNextPage = total - (skip + limit) > 0;
  //   return {
  //     data: aggregationResult[0].data,
  //     pagination: {
  //       total,
  //       hasNextPage,
  //     },
  //   };
  // }

  async softDelete(filter?: FilterQuery<T>, options?: MongooseUpdateQueryOptions<T>): Promise<any> {
    return this._model.updateMany(filter, { deletedAt: new Date(), isDeleted: true }, options);
  }

  async softDeleteById(
    id: ObjectId | string,
    options?: MongooseUpdateQueryOptions<T>,
  ): Promise<any> {
    return this._model.updateOne({ _id: id }, { deletedAt: new Date(), isDeleted: true });
  }

  async restoreSoftDeleted(id: ObjectId | string): Promise<any> {
    return this._model.updateOne({ _id: id }, { deletedAt: null, isDeleted: false });
  }

  async findSoftDeleteById(
    id: ObjectId | string,
    options?: MongooseUpdateQueryOptions<T>,
  ): Promise<any> {
    return this._model.findOne(
      { _id: id, deletedAt: { $ne: null }, isDeleted: true },
      null,
      options,
    );
  }

  async findSoftDeleted(): Promise<any> {
    return this._model.find({ deletedAt: { $ne: null }, isDeleted: true });
  }

  async findWithSoftDeleted(): Promise<any> {
    return this._model.find({});
  }

  async total(filter: FilterQuery<T>): Promise<number> {
    return this._model.countDocuments(filter);
  }
  async totalAggregate(stages: PipelineStage[]): Promise<number> {
    const result = await this._model.aggregate([...stages, { $count: 'totalCount' }]);
    return result[0]?.totalCount || 0;
  }
}
