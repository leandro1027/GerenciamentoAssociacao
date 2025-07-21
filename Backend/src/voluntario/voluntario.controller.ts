import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { VoluntarioService } from './voluntario.service';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('voluntario')
export class VoluntarioController {
  constructor(private readonly voluntarioService: VoluntarioService) {}

  // Rota para UTILIZADOR LOGADO: Qualquer utilizador autenticado pode candidatar-se.
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createVoluntarioDto: CreateVoluntarioDto) {
    return this.voluntarioService.create(createVoluntarioDto);
  }

  // Rota de ADMIN: Apenas administradores podem ver todas as candidaturas.
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.voluntarioService.findAll();
  }

  // Rota de ADMIN: Apenas administradores podem aprovar/recusar candidaturas.
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVoluntarioDto: UpdateVoluntarioDto) {
    return this.voluntarioService.update(id, updateVoluntarioDto);
  }
}
