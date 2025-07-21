import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Se não há cargos definidos, permite o acesso
    }
    const { user } = context.switchToHttp().getRequest();
    
    // Verifica se o cargo do utilizador está na lista de cargos permitidos
    return requiredRoles.some((role) => user?.role?.includes(role));
  }
}
