// Em: src/parceiros/parceiros.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ParceirosService } from './parceiros.service';
import { CreateParceiroDto } from './dto/create-parceiro.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('parceiros')
export class ParceirosController {
  constructor(private readonly parceirosService: ParceirosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body() body: any, // Recebemos o body como 'any' para o diagnóstico
    @UploadedFile() file: Express.Multer.File,
  ) {
    // --- INÍCIO DO DIAGNÓSTICO ---
    console.log('--------------------------------------------------');
    console.log('ROTA DE CRIAÇÃO DE PARCEIRO ATIVADA');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('BODY COMPLETO RECEBIDO PELO CONTROLLER:', body);
    console.log('TIPO DO BODY:', typeof body);
    console.log('VALOR DO CAMPO "nome":', body.nome);
    console.log('FICHEIRO RECEBIDO:', file ? { filename: file.filename, mimetype: file.mimetype, size: file.size } : 'NENHUM FICHEIRO RECEBIDO');
    console.log('--------------------------------------------------');
    // --- FIM DO DIAGNÓSTICO ---

    if (!file) {
      throw new BadRequestException('O ficheiro do logótipo é obrigatório.');
    }

    // Validação manual para garantir que o campo 'nome' existe e é válido
    if (!body.nome || typeof body.nome !== 'string' || body.nome.trim() === '') {
      console.error('ERRO: Validação manual falhou. O campo "nome" está em falta ou é inválido.');
      throw new BadRequestException('O campo "nome" é obrigatório e não pode estar vazio.');
    }

    // Criamos o DTO manualmente para passar ao service
    const createParceiroDto: CreateParceiroDto = {
      nome: body.nome.trim(),
    };

    return this.parceirosService.create(createParceiroDto, file);
  }

  @Get()
  findAll() {
    return this.parceirosService.findAll();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parceirosService.remove(id);
  }
}