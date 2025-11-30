import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Super Admin has access to everything
    if (user.isPlatformAdmin) {
      return true;
    }

    // Check if user has required role in current tenant context
    const tenantId = context.switchToHttp().getRequest().params.tenantId;
    
    if (!tenantId) {
      return false;
    }

    const membership = user.memberships?.find(
      (m: any) => m.tenantId === tenantId,
    );

    if (!membership) {
      return false;
    }

    return requiredRoles.includes(membership.role);
  }
}