import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
/**
 * ${1:Description placeholder}
 *
 * @type {*}
 */
export const LoginDetail = createParamDecorator((data, ctx) => {
  const loginMeta = GqlExecutionContext.create(ctx).getContext().req.user;
  return loginMeta;
});
