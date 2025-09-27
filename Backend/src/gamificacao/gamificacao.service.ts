import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { UpdateConquistaDto } from './dto/update-conquista.dto';

@Injectable()
export class GamificacaoService {
  private readonly logger = new Logger(GamificacaoService.name);
  constructor(private readonly prisma: PrismaService) {}

  // --- MÉTODOS DE GESTÃO DE CONQUISTAS (CRUD) ---

  async create(createConquistaDto: CreateConquistaDto) {
    return this.prisma.conquista.create({
      data: createConquistaDto,
    });
  }

  async findAll() {
    return this.prisma.conquista.findMany();
  }

  async findOne(id: number) {
    const conquista = await this.prisma.conquista.findUnique({ where: { id } });
    if (!conquista) {
      throw new NotFoundException(`Conquista com ID ${id} não encontrada.`);
    }
    return conquista;
  }

  async update(id: number, updateConquistaDto: UpdateConquistaDto) {
    await this.findOne(id); // Verifica se a conquista existe
    return this.prisma.conquista.update({
      where: { id },
      data: updateConquistaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verifica se a conquista existe
    return this.prisma.conquista.delete({ where: { id } });
  }

  // --- MÉTODOS DE LÓGICA INTERNA DA GAMIFICAÇÃO ---

  private async isGamificacaoAtiva(): Promise<boolean> {
    const config = await this.prisma.configuracao.findUnique({
      where: { id: 1 },
    });
    return config?.gamificacaoAtiva ?? false;
  }

  async adicionarPontos(usuarioId: number, pontos: number): Promise<void> {
    if (!(await this.isGamificacaoAtiva()) || !usuarioId) {
      return;
    }
    this.logger.log(`Adicionando ${pontos} pontos ao utilizador ${usuarioId}`);
    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        pontos: {
          increment: pontos,
        },
      },
    });
  }
  
  async verificarEAdicionarConquista(
    usuarioId: number,
    nomeConquista: string,
  ): Promise<void> {
    if (!(await this.isGamificacaoAtiva()) || !usuarioId) {
      return;
    }
    const conquista = await this.prisma.conquista.findUnique({
      where: { nome: nomeConquista },
    });
    if (!conquista) {
      this.logger.warn(`Conquista "${nomeConquista}" não encontrada.`);
      return;
    }
    const possuiConquista = await this.prisma.usuarioConquista.findUnique({
      where: {
        usuarioId_conquistaId: {
          usuarioId: usuarioId,
          conquistaId: conquista.id,
        },
      },
    });
    if (!possuiConquista) {
      this.logger.log(`Atribuindo conquista "${nomeConquista}" ao utilizador ${usuarioId}`);
      await this.prisma.usuarioConquista.create({
        data: {
          usuarioId: usuarioId,
          conquistaId: conquista.id,
        },
      });
      if (conquista.pontosBonus > 0) {
        await this.adicionarPontos(usuarioId, conquista.pontosBonus);
      }
    }
  }
}