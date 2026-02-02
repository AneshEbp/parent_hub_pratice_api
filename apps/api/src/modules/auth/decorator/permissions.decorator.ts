
import { PermissionsGuard } from '@app/data-access/permission/permission.guard';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthUserGuard } from 'apps/api/src/guards/auth.user.guard';

export function Permissions(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(AuthUserGuard, PermissionsGuard),
  );
}
