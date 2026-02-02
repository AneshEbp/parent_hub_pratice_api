import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { MongooseProvider } from '../providers/database.provider';
import { GraphQLProvider } from '../providers/graphql.provider';
import { ConfigProvider } from '../providers/config.provider';
import { AuthModule } from './modules/auth/auth.module';
import { ApiResolver } from './api.resolver';
import { EmailModule } from '@app/email/email.module';
import { UsersModule } from './modules/users/users.module';
import { AgoraModule } from './modules/agora/agora.module';
import { ProcessorModule } from './modules/processor/processor.module';

@Module({
  imports: [
    ConfigProvider,
    GraphQLProvider,
    MongooseProvider,
    AuthModule,
    EmailModule.forRoot(),
    UsersModule,
    AgoraModule,
    ProcessorModule
  ],
  controllers: [ApiController],
  providers: [ApiService, ApiResolver],
})
export class ApiModule { }
