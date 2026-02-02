import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TermsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipTermsAcceptanceCheck = this.reflector.get<boolean>(
      'skipTermsAcceptanceCheck',
      context.getHandler(),
    );

    if (skipTermsAcceptanceCheck) return true;

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user?.isTermsVersionSynced) {
      throw new ForbiddenException('User has not accepted the latest terms and conditions');
    }

    return true;
  }
}
