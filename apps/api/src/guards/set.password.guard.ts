import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class SetPasswordGuard extends AuthGuard('jwt') {
  constructor(private readonly i18nService: I18nService) {
    // Inject UserService
    super(); // Call the constructor of AuthGuard
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  handleRequest(err, loginMeta, info, context) {
    if (loginMeta && loginMeta.grant == 'set_password') {
      return loginMeta;
    } else {
      throw new HttpException(
        this.i18nService.t('users.unauthorized_user'),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
