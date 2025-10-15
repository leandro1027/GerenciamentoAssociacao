import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Request, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.senha);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    // A lógica de gamificação é tratada dentro do authService.login
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // O objeto 'req.user' é populado pelo JwtAuthGuard após validar o token
    return req.user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    // Mensagem genérica para não confirmar se um e-mail está ou não cadastrado
    return { message: 'Se um usuário com esse e-mail existir, um link de redefinição foi enviado.' };
  }

  @Get('validate-reset-token/:token')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 (Success, No Content) se o token for válido
  async validateResetToken(@Param('token') token: string) {
    // Apenas valida, não retorna corpo na resposta em caso de sucesso
    await this.authService.validateResetToken(token);
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 em caso de sucesso
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    await this.authService.resetPassword(token, resetPasswordDto);
  }
}