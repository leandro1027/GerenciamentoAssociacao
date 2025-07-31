import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuarioService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.senha))) {
      const { senha, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usuarioService.findByEmail(email);
    if (!user) {
      // Retornamos silenciosamente para não revelar se um e-mail existe no sistema.
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Expira em 10 minutos

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { passwordResetToken, passwordResetExpires },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    // CORRIGIDO: A URL do frontend agora é lida a partir das variáveis de ambiente.
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetURL = `${frontendUrl}/redefinir-senha/${resetToken}`;
    
    const mailOptions = {
      to: user.email,
      from: 'Associação <leandrobalaban78@gmail.com>',
      subject: 'Redefinição de Senha da Sua Conta',
      text: `Você solicitou a redefinição da sua senha.\n\nClique no seguinte link para completar o processo:\n\n${resetURL}\n\nEste link irá expirar em 10 minutos.\n`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erro ao enviar e-mail de redefinição:", error);
      // Mesmo com erro no envio, o token foi gerado. O utilizador pode tentar novamente.
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.usuario.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date().toISOString() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(resetPasswordDto.senha, salt);

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        senha: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }
}
