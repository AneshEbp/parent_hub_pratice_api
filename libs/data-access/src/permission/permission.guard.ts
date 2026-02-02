import { PermissionRepository } from '@app/data-access/permission';
import { RoleRepository } from '@app/data-access/roles';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionRepository: PermissionRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required, allow access
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;
    if (!user?.roles) {
      throw new ForbiddenException('User not authenticated');
    }

    const roles = await this.roleRepository.find({ _id: { $in: user.roles } });
    const rolesSlug = roles.map((role) => role.slug);
    if (rolesSlug.includes('super-admin')) {
      return true;
    }

    const permissionsIds = roles.flatMap((role) => role.permissions);
    const permissions = await this.permissionRepository.find({ _id: { $in: permissionsIds } });
    const permissionSlugs = permissions.map((permission) => permission.slug);
    const hasPermission = requiredPermissions.every((permission) =>
      permissionSlugs.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('User has no permission');
    }

    return true;
  }
}
