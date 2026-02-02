import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepo } from './../repository/base.repo';
import { DisposableEmail, DisposableEmailDocument } from './disposable-email.schema';
import { Model } from 'mongoose';

@Injectable()
export class DisposableEmailRepository extends BaseRepo<DisposableEmailDocument> {
  constructor(
    @InjectModel(DisposableEmail.name)
    private readonly disposableEmailModel: Model<DisposableEmailDocument>,
  ) {
    super(disposableEmailModel);
  }
}
