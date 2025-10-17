import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { GamificacaoService } from './gamificacao.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { UpdateConquistaDto } from './dto/update-conquista.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'; // Removidos imports não usados

@ApiTags('Gamificação')
@Controller('gamificacao')
export class GamificacaoController {
  constructor(private readonly gamificacaoService: GamificacaoService) {}

  // ===================================================================
  // ROTAS PÚBLICAS (Acessíveis por qualquer visitante)
  // ===================================================================

  // ✅ Esta rota agora é pública, pois não tem @UseGuards
  @Get('usuario/:id/conquistas')
  findConquistasPorUsuarioId(@Param('id', ParseIntPipe) id: number) {
    return this.gamificacaoService.findConquistasByUsuario(id);
  }

  // ===================================================================
  // ROTAS PRIVADAS (Acessíveis apenas por usuários logados)
  // ===================================================================

  @Get('minhas-conquistas')
  @UseGuards(JwtAuthGuard) // Proteção individual
  @ApiBearerAuth()
  findMinhasConquistas(@Request() req) {
    const usuarioId = req.user.id;
    return this.gamificacaoService.findConquistasByUsuario(usuarioId);
  }

  @Get('login-history')
  @UseGuards(JwtAuthGuard) // Proteção individual
  @ApiBearerAuth()
  async getLoginHistory(@Request() req) {
    const usuarioId = req.user.id;
    return this.gamificacaoService.getLoginHistory(usuarioId);
  }

  // ===================================================================
  // ROTAS DE ADMINISTRAÇÃO (Acessíveis apenas por Admins logados)
  // ===================================================================

  @Post('conquistas')
  @UseGuards(JwtAuthGuard, RolesGuard) // Proteção individual
  @Roles('ADMIN')
  @ApiBearerAuth()
  create(@Body() createConquistaDto: CreateConquistaDto) {
    return this.gamificacaoService.create(createConquistaDto);
  }

  @Get('conquistas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  findAll() {
    return this.gamificacaoService.findAll();
  }
  
  @Get('conquistas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamificacaoService.findOne(id);
  }

  @Patch('conquistas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConquistaDto: UpdateConquistaDto,
  ) {
    return this.gamificacaoService.update(id, updateConquistaDto);
  }

  @Delete('conquistas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamificacaoService.remove(id);
  }
}