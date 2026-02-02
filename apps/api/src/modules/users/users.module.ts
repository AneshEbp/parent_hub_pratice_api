import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModels } from './mongoose-models';
import { providers } from './providers';
import { AuthenticationModule } from '@app/authentication';
import { UsersService } from './users.service';
import { UsersRepository } from '@app/data-access';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UsersModule
 * @typedef {UsersModule}
 */
@Module({
  imports: [
    JwtModule,
    HttpModule,
    AuthenticationModule,
    MongooseModule.forFeature(mongooseModels),
    AuthModule,
  ],
  providers: providers,
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
