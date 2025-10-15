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
  Request, // ALTERAÇÃO: Importa o decorator Request
} from '@nestjs/common';
import { VoluntarioService } from './voluntario.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { UpdateVoluntarioDto } from './dto/update-voluntario.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
// A importação do GetUser foi removida
import { Usuario } from '@prisma/client';

@Controller('voluntario')
@UseGuards(JwtAuthGuard)
export class VoluntarioController {
  constructor(private readonly voluntarioService: VoluntarioService) {}

  @Post()
  // ALTERAÇÃO: Usamos @Request() para pegar o objeto de requisição completo
  create(@Body() createVoluntarioDto: CreateVoluntarioDto, @Request() req) {
    // O JwtAuthGuard anexa o 'user' ao request. Extraímos o ID dele aqui.
    const usuarioId = req.user.id;
    return this.voluntarioService.create(createVoluntarioDto, usuarioId);
  }

  @Get('meu-status')
  // ALTERAÇÃO: Usamos @Request() aqui também
  findMyStatus(@Request() req) {
    const usuarioId = req.user.id;
    return this.voluntarioService.findOneByUserId(usuarioId);
  }

  // ===================================================================
  // ROTAS DE ADMINISTRAÇÃO (Nenhuma alteração necessária aqui)
  // ===================================================================

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.voluntarioService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoluntarioDto: UpdateVoluntarioDto,
  ) {
    return this.voluntarioService.update(id, updateVoluntarioDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.voluntarioService.remove(id);
  }
}