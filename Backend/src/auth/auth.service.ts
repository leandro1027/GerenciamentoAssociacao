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
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 2 * 60 * 1000); // Expira em 2 minutos

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { passwordResetToken, passwordResetExpires },
    });

    const emailUser = this.configService.get<string>('EMAIL_USER');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetURL = `${frontendUrl}/redefinir-senha/${resetToken}`;
    
    const mailOptions = {
      to: user.email,
      from: `Associação <${emailUser}>`,
      subject: 'Redefinição de Senha da Sua Conta',
      text: `Você solicitou a redefinição da sua senha.\n\nClique no seguinte link para completar o processo:\n\n${resetURL}\n\nEste link irá expirar em 2 minutos.\n`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erro ao enviar e-mail de redefinição:", error);
    }
  }

  // --- NOVO MÉTODO ADICIONADO ---
  async validateResetToken(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.usuario.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Link inspirado, por favor solicite um novo.');
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<void> {
    // 1. Reutiliza a lógica de validação
    await this.validateResetToken(token);

    // 2. Busca o usuário novamente para obter o ID (a validação já garante que ele existe)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.usuario.findFirst({
        where: { passwordResetToken: hashedToken }
    });

    // Esta verificação é uma segurança extra, mas a lógica principal está no validateResetToken
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