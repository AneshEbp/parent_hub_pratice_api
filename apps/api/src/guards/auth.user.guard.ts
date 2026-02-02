import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthUserGuard extends AuthGuard('jwt') {
  constructor(private readonly i18nService: I18nService) {
    // Inject UserService
    super(); // Call the constructor of AuthGuard
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  handleRequest(err, loginMeta, info, context) {
    /**
     * Has user and has set password
     */
    if (loginMeta && loginMeta.grant == 'all') {
      return loginMeta;
    } else {
      throw new UnauthorizedException(this.i18nService.t('users.unauthorized_user'));
    }
  }
}
