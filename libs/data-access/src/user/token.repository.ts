import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepo } from '../repository/base.repo';
import { EmailToken, EmailTokenDocument } from './token.schema';

@Injectable()
export class TokenRepository extends BaseRepo<EmailTokenDocument> {
  constructor(@InjectModel(EmailToken.name) emailToken: Model<EmailTokenDocument>) {
    super(emailToken);
  }
}
