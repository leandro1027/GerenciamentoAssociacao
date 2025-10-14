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
    private gamificacaoService: GamificacaoService, // Serviço de gamificação injetado
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuarioService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.senha))) {
      // Retorna o objeto de usuário completo para ser usado no login
      return user;
    }
    return null;
  }

  // --- MÉTODO LOGIN ATUALIZADO E CORRIGIDO ---
  async login(user: Usuario) {
    let dailyPointsAwarded = false;

    // 1. Processa o bônus de login diário ANTES de buscar os dados finais
    const bonusResult = await this.processarBonusLoginDiario(user);
    if (bonusResult) {
      dailyPointsAwarded = true;
    }
    
    // 2. Re-busca o usuário do banco DEPOIS de processar o bônus.
    // Isso garante que a pontuação retornada para o frontend já esteja atualizada.
    const usuarioAtualizado = await this.prisma.usuario.findUnique({
      where: { id: user.id },
    });

    if (!usuarioAtualizado) {
      throw new UnauthorizedException("Usuário não encontrado após a validação.");
    }

    // Constrói manualmente o objeto de resposta para evitar o erro de tipagem
    // e garantir que a senha seja excluída.
    const userResponse = {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        role: usuarioAtualizado.role,
        telefone: usuarioAtualizado.telefone,
        profileImageUrl: usuarioAtualizado.profileImageUrl,
        passwordResetToken: usuarioAtualizado.passwordResetToken,
        passwordResetExpires: usuarioAtualizado.passwordResetExpires,
        divulgacoes_aprovadas: usuarioAtualizado.divulgacoes_aprovadas,
        estado: usuarioAtualizado.estado,
        cidade: usuarioAtualizado.cidade,
        pontos: usuarioAtualizado.pontos,
        ultimoLoginComPontos: usuarioAtualizado.ultimoLoginComPontos,
    };

    const payload = { email: userResponse.email, sub: userResponse.id, role: userResponse.role };
    
    // 3. Retorna o token, o usuário JÁ ATUALIZADO e a flag de bônus
    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
      dailyPointsAwarded,
    };
  }

  // --- MÉTODO PRIVADO PARA A LÓGICA DE LOGIN DIÁRIO ---
  private async processarBonusLoginDiario(user: Usuario): Promise<boolean> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera o horário para comparar apenas o dia

    const ultimoLogin = user.ultimoLoginComPontos;
    let ultimoLoginDate: Date | null = null;
    if (ultimoLogin) {
        ultimoLoginDate = new Date(ultimoLogin);
        ultimoLoginDate.setHours(0, 0, 0, 0); // Zera o horário do último login também
    }
    
    // Se o usuário nunca recebeu pontos por login ou se o último foi em um dia anterior
    if (!ultimoLoginDate || ultimoLoginDate.getTime() < hoje.getTime()) {
      // Concede 5 pontos
      await this.gamificacaoService.adicionarPontos(user.id, 5);
      
      // Atualiza a data do último login para agora, registrando que o bônus foi dado hoje
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoLoginComPontos: new Date() },
      });
      
      return true; // Retorna true para indicar que os pontos foram concedidos
    }

    return false; // Retorna false se os pontos não foram concedidos (já logou hoje)
  }


  async forgotPassword(email: string): Promise<void> {
    const user = await this.usuarioService.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Expira em 10 minutos

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
      throw new BadRequestException('Link inspirado, por favor solicite um novo.');
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

