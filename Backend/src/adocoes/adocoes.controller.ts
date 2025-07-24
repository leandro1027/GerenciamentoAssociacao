// src/adocoes/adocoes.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AdocoesService } from './adocoes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAdocoeDto } from './dto/create-adocoe.dto';

@Controller('adocoes')
export class AdocoesController {
  constructor(private readonly adocoesService: AdocoesService) {}

  @UseGuards(JwtAuthGuard) // Protege a rota, só para usuários logados
  @Post()
  create(@Body() createAdocaoDto: CreateAdocoeDto, @Request() req) {
    const userId = req.user.id; // Pega o ID do usuário logado (do token JWT)
    return this.adocoesService.create(createAdocaoDto, userId);
  }
}