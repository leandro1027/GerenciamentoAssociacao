import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usuarioService: UsuarioService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('A variável de ambiente JWT_SECRET não está definida.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.usuarioService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilizador não encontrado.');
    }
    // Retornamos o utilizador completo (incluindo o cargo)
    return user;
  }
}
