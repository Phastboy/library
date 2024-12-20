import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from 'src/types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from metadata (via @Roles decorator)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Extract the authenticated user from the request object
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const userId = request.userId; // Extract user ID from request

    Logger.log(
      `User ID: ${userId} requesting access with roles: ${requiredRoles.join(', ')}`,
      RoleGuard.name,
    );

    // Fetch user details from the database
    const user = await this.usersService.find(RoleGuard, { id: userId });

    // If user doesn't exist, throw UnauthorizedException
    if (!user) {
      Logger.warn(`User with ID: ${userId} not found`, RoleGuard.name);
      throw new UnauthorizedException('User not found');
    }

    // If user doesn't have the required role, deny access
    if (!user.role || !requiredRoles.includes(user.role)) {
      Logger.warn(
        `User with ID: ${userId} does not have required role. User role: ${user.role}`,
        RoleGuard.name,
      );
      throw new UnauthorizedException(
        `You do not have the required role. Required: ${requiredRoles.join(', ')}, Your Role: ${user.role}`,
      );
    }

    return true;
  }
}
