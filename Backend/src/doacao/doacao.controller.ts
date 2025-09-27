import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DoacaoService } from './doacao.service';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard'; // <-- Verifique o caminho
import { Roles } from 'src/auth/roles.decorator'; // <-- Verifique o caminho
import { UpdateDoacaoStatusDto } from './dto/update-doacao-status.dto'; // <-- Novo DTO

@Controller('doacao')
export class DoacaoController {
  constructor(private readonly doacaoService: DoacaoService) {}

  // ROTA PÚBLICA: Qualquer pessoa pode iniciar uma doação.
  @Post()
  create(@Body() createDoacaoDto: CreateDoacaoDto) {
    return this.doacaoService.create(createDoacaoDto);
  }

  // --- ROTAS DE ADMINISTRAÇÃO ---

  // Rota para o admin listar todas as doações
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.doacaoService.findAll();
  }

  // Rota para o admin ver uma doação específica
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
 @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doacaoService.findOne(id);
  }

  // --- NOVA ROTA PARA O ADMIN CONFIRMAR/REJEITAR DOAÇÃO ---
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoacaoStatusDto: UpdateDoacaoStatusDto,
  ) {
    return this.doacaoService.updateStatus(id, updateDoacaoStatusDto);
  }

  // Rota para o admin atualizar dados de uma doação (ex: corrigir valor)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoacaoDto: UpdateDoacaoDto,
  ) {
    return this.doacaoService.update(id, updateDoacaoDto);
  }

  // Rota para o admin remover uma doação
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.doacaoService.remove(id);
  }
}