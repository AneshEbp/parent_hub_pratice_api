import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './social-auth.module-definition';
import { SocialAuthService } from './services';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [SocialAuthService],
  exports: [SocialAuthService],
})
export class SocialAuthModule extends ConfigurableModuleClass {}
