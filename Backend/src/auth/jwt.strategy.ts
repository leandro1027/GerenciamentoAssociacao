import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuarioService: UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECREDO', 
    });
  }

  // Esta função é chamada automaticamente após a validação do token
  async validate(payload: { sub: number; email: string; role: string }) {
    // O 'payload' contém os dados que colocámos no token (id, email, role)
    const user = await this.usuarioService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilizador não encontrado.');
    }
    // O objeto que retornamos aqui será injetado no objeto 'request' dos controladores
    return user;
  }
}