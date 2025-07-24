// src/adocoes/adocoes.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdocoeDto } from './dto/create-adocoe.dto';

@Injectable()
export class AdocoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdocaoDto: CreateAdocoeDto, userId: number) {
    // Associa o ID do animal (vindo do frontend) com o ID do usuário (vindo do token)
    return this.prisma.adocao.create({
      data: {
        animalId: createAdocaoDto.animalId,
        usuarioId: userId,
        // O status inicial será 'SOLICITADA' por padrão, como definido no schema.prisma
      },
    });
  }
}