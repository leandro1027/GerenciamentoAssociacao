// backend/src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.senha);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // O objeto 'req.user' é adicionado pelo Guard após validar o token
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'Se um utilizador com esse e-mail existir, um link de redefinição foi enviado.' };
  }

  @Post('reset-password/:token')
  async resetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(token, resetPasswordDto);
    return { message: 'Senha redefinida com sucesso.' };
  }
}
