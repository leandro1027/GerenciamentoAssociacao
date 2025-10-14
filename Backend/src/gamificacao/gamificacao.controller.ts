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
} from '@nestjs/common';
import { GamificacaoService } from './gamificacao.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { UpdateConquistaDto } from './dto/update-conquista.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // <-- Ajuste o caminho se necessário
import { RolesGuard } from 'src/auth/roles.guard'; // <-- Ajuste o caminho se necessário
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Usuario } from '@prisma/client';

@Controller('gamificacao')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todas as rotas com autenticação e verificação de role
export class GamificacaoController {
  constructor(private readonly gamificacaoService: GamificacaoService) {}

  // Rota para criar uma nova conquista (só para admins)
  @Post('conquistas')
  @Roles('ADMIN')
  create(@Body() createConquistaDto: CreateConquistaDto) {
    return this.gamificacaoService.create(createConquistaDto);
  }

  

  // Rota para listar todas as conquistas (só para admins)
  @Get('conquistas')
  @Roles('ADMIN')
  findAll() {
    return this.gamificacaoService.findAll();
  }

    @Get('minhas-conquistas')
  @UseGuards(JwtAuthGuard) // Protege a rota, mas permite que QUALQUER usuário logado acesse
  findMinhasConquistas(@CurrentUser() user: Usuario) {
    return this.gamificacaoService.findConquistasByUsuario(user.id);
  }

  // Rota para obter detalhes de uma conquista (só para admins)
  @Get('conquistas/:id')
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamificacaoService.findOne(id);
  }

  // Rota para atualizar uma conquista (só para admins)
  @Patch('conquistas/:id')
   @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConquistaDto: UpdateConquistaDto,
  ) {
    return this.gamificacaoService.update(id, updateConquistaDto);
  }

  // Rota para remover uma conquista (só para admins)
  @Delete('conquistas/:id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamificacaoService.remove(id);
  }
}