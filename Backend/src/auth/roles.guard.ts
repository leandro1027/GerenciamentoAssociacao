import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Se não há cargos definidos, permite o acesso
    }
    const { user } = context.switchToHttp().getRequest();
    // Num sistema com JWT, o 'user' viria do token. Aqui, vamos simular.
    // Para este projeto, a proteção real estará no front-end.
    // Esta estrutura está aqui para mostrar como seria num projeto real.
    return true; // Para este projeto, vamos manter o acesso aberto na API
  }
}