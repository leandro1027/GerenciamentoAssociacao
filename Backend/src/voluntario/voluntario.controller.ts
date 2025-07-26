import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, createParamDecorator, ExecutionContext, ParseIntPipe } from '@nestjs/common';
import { VoluntarioService } from './voluntario.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Request as ExpressRequest } from 'express';
import { Usuario } from 'generated/prisma';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

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

  @UseGuards(JwtAuthGuard)
  @Get('meu-status')
  findMyStatus(@GetUser() user: Usuario) {
    return this.voluntarioService.findOneByUserId(user.id);
  }

  // Rota de ADMIN: Apenas administradores podem aprovar/recusar candidaturas.
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVoluntarioDto: UpdateVoluntarioDto) {
    return this.voluntarioService.update(id, updateVoluntarioDto);
  }
}
