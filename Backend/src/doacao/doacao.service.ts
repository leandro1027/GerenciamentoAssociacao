import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoacaoDto } from './dto/create-doacao.dto';
import { UpdateDoacaoDto } from './dto/update-doacao.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GamificacaoService } from 'src/gamificacao/gamificacao.service'; // 1. Importar o GamificacaoService
import { UpdateDoacaoStatusDto } from './dto/update-doacao-status.dto'; // Importar o novo DTO
import { StatusDoacao } from '@prisma/client';

@Injectable()
export class DoacaoService {
  // 2. Injetar o GamificacaoService no construtor
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificacaoService: GamificacaoService,
  ) {}

  create(createDoacaoDto: CreateDoacaoDto) {
    return this.prisma.doacao.create({
      data: createDoacaoDto,
    });
  }

  findAll() {
    return this.prisma.doacao.findMany({
      include: {
        usuario: true,
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const doacao = await this.prisma.doacao.findUnique({
      where: { id },
      include: { usuario: true }, // Incluir usuário para ter acesso ao nome no frontend
    });

    if (!doacao) {
      throw new NotFoundException(`Doação com id ${id} não encontrada.`);
    }

    return doacao;
  }

  // --- NOVO MÉTODO PARA ATUALIZAR APENAS O STATUS ---
  async updateStatus(id: number, updateDoacaoStatusDto: UpdateDoacaoStatusDto) {
    await this.findOne(id); // Garante que a doação existe

    const doacaoAtualizada = await this.prisma.doacao.update({
      where: { id },
      data: {
        status: updateDoacaoStatusDto.status,
      },
    });

    // --- AQUI ACONTECE A MÁGICA DA GAMIFICAÇÃO ---
    if (
      doacaoAtualizada.status === StatusDoacao.CONFIRMADA &&
      doacaoAtualizada.usuarioId
    ) {
      // 1. Atribuir pontos (ex: 1 ponto por cada real doado)
      const pontosGanhos = Math.floor(doacaoAtualizada.valor);
      await this.gamificacaoService.adicionarPontos(
        doacaoAtualizada.usuarioId,
        pontosGanhos,
      );

      // 2. Verificar se é a primeira doação do usuário para dar a conquista
      const totalDoacoesConfirmadas = await this.prisma.doacao.count({
        where: {
          usuarioId: doacaoAtualizada.usuarioId,
          status: StatusDoacao.CONFIRMADA,
        },
      });

      if (totalDoacoesConfirmadas === 1) {
        await this.gamificacaoService.verificarEAdicionarConquista(
          doacaoAtualizada.usuarioId,
          'Primeiro Apoiador',
        );
      }
    }

    return doacaoAtualizada;
  }

  // Mantemos o update genérico caso precise ser usado em outro lugar
  async update(id: number, updateDoacaoDto: UpdateDoacaoDto) {
    await this.findOne(id);
    return this.prisma.doacao.update({
      where: { id },
      data: updateDoacaoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.doacao.delete({
      where: { id },
    });
  }
}