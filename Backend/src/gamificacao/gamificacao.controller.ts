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
  Req,
} from '@nestjs/common';
import { GamificacaoService } from './gamificacao.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { UpdateConquistaDto } from './dto/update-conquista.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Gamificação')
@ApiBearerAuth()
@Controller('gamificacao')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege TODAS as rotas do controller
export class GamificacaoController {
  constructor(private readonly gamificacaoService: GamificacaoService) {}

  // ===================================================================
  // ROTAS DO USUÁRIO (Acessíveis por qualquer usuário logado)
  // ===================================================================


  /**
   * Retorna todas as conquistas ganhas pelo usuário autenticado.
   */
  @Get('minhas-conquistas')
  @ApiOperation({ summary: 'Lista as conquistas do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Conquistas retornadas com sucesso.'})
  @ApiResponse({ status: 401, description: 'Não autorizado.'})
  findMinhasConquistas(@Request() req) {
    // O @UseGuards aqui era redundante, pois já está definido para a classe inteira.
    const usuarioId = req.user.sub;
    return this.gamificacaoService.findConquistasByUsuario(usuarioId);
  }


  // ===================================================================
  // ROTAS DE ADMINISTRAÇÃO (Acessíveis apenas por usuários com role 'ADMIN')
  // ===================================================================

  @Post('conquistas')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cria uma nova conquista (Admin)' })
  create(@Body() createConquistaDto: CreateConquistaDto) {
    return this.gamificacaoService.create(createConquistaDto);
  }

  @Get('conquistas')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lista todas as conquistas existentes (Admin)' })
  findAll() {
    return this.gamificacaoService.findAll();
  }
  
  @Get('conquistas/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Busca uma conquista por ID (Admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamificacaoService.findOne(id);
  }

  @Patch('conquistas/:id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Atualiza uma conquista (Admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConquistaDto: UpdateConquistaDto,
  ) {
    return this.gamificacaoService.update(id, updateConquistaDto);
  }

  @Get('login-history')
  @UseGuards(JwtAuthGuard)
  async getLoginHistory(@Req() req) {
    const usuarioId = req.user.id;
    return this.gamificacaoService.getLoginHistory(usuarioId);
  }

  @Delete('conquistas/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma conquista (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamificacaoService.remove(id);
  }
}