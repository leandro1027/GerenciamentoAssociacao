import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service';
import { Usuario } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private gamificacaoService: GamificacaoService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuarioService.findByEmail(email);
    // Compara a senha fornecida com o hash armazenado no banco
    if (user && (await bcrypt.compare(pass, user.senha))) {
      const { senha, ...result } = user; // Remove a senha do objeto retornado
      return result;
    }
    return null;
  }

  async login(user: Omit<Usuario, 'senha'>) {
    let dailyPointsAwarded = false;

    // 1. Processa o bônus e registra o login diário
    const bonusResult = await this.processarBonusLoginDiario(user);
    if (bonusResult) {
      dailyPointsAwarded = true;
    }
    
    // 2. Re-busca os dados do usuário para garantir que a pontuação esteja atualizada
    const usuarioAtualizado = await this.prisma.usuario.findUnique({
      where: { id: user.id },
    });

    if (!usuarioAtualizado) {
      throw new UnauthorizedException("Usuário não encontrado após a validação.");
    }

    // 3. Remove a senha do objeto final antes de enviar como resposta
    const { senha, ...userResponse } = usuarioAtualizado;

    // 4. Cria o payload para o token JWT
    const payload = { email: userResponse.email, sub: userResponse.id, role: userResponse.role };
    
    // 5. Retorna o token, os dados do usuário atualizados e a flag de bônus
    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
      dailyPointsAwarded,
    };
  }
    
    private async processarBonusLoginDiario(user: Omit<Usuario, 'senha'>): Promise<boolean> {
    // --- INÍCIO DA CORREÇÃO ---
    // 1. Verifica PRIMEIRO se a gamificação está ativa.
    const gamificacaoAtiva = await this.gamificacaoService.isGamificacaoAtiva();
    if (!gamificacaoAtiva) {
      return false; // Se não estiver ativa, para a função aqui mesmo.
    }
    
    const hoje = new Date();
    // Use UTC para evitar problemas com fuso horário
    hoje.setUTCHours(0, 0, 0, 0);

    // Busca o usuário completo com o campo `ultimoLoginComPontos`
    const usuarioCompleto = await this.prisma.usuario.findUnique({ where: { id: user.id }});
    const ultimoLogin = usuarioCompleto?.ultimoLoginComPontos;

    let ultimoLoginDate: Date | null = null;
    if (ultimoLogin) {
        ultimoLoginDate = new Date(ultimoLogin);
        ultimoLoginDate.setUTCHours(0, 0, 0, 0);
    }
    
    // Concede pontos apenas se for o primeiro login do dia
    if (!ultimoLoginDate || ultimoLoginDate.getTime() < hoje.getTime()) {
      // Concede 5 pontos de bônus
      await this.gamificacaoService.adicionarPontos(user.id, 5);
      
      // Atualiza a data do último login com pontos no perfil do usuário
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoLoginComPontos: new Date() },
      });

      // --- PONTO CHAVE: Cria um registro no histórico de logins diários ---
      await this.prisma.loginDiario.create({
        data: {
          usuarioId: user.id, // user.id é Int, correspondendo ao schema
          data: hoje,         // Armazena a data (sem hora) do login
        },
      });
      
      return true; // Informa que os pontos foram concedidos
    }

    return false; // Informa que os pontos não foram concedidos (já logou hoje)
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usuarioService.findByEmail(email);
    if (!user) {
      return; // Não revele se o e-mail existe ou não por segurança
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

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
      text: `Você solicitou a redefinição da sua senha.\n\nClique no seguinte link para completar o processo:\n\n${resetURL}\n\nEste link irá expirar em 10 minutos.\n`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erro ao enviar e-mail de redefinição:", error);
      // Considere adicionar um log mais robusto aqui
    }
  }

  async validateResetToken(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.usuario.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Link de redefinição inválido ou expirado.');
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.validateResetToken(token);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.usuario.findFirst({
        where: { passwordResetToken: hashedToken }
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