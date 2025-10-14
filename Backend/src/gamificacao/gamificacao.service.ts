import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { UpdateConquistaDto } from './dto/update-conquista.dto';
import { Prisma, StatusAdocao } from '@prisma/client';

@Injectable()
export class GamificacaoService {
  private readonly logger = new Logger(GamificacaoService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ===================================================================
  // MÉTODOS DE LÓGICA DE NEGÓCIO (Chamados por outros serviços)
  // ===================================================================

  /**
   * Processa as recompensas (pontos e conquistas) para um usuário
   * quando uma de suas adoções é aprovada.
   * @param usuarioId ID do usuário que realizou a adoção.
   * @param prisma O cliente Prisma da transação para garantir a atomicidade.
   */
  async processarRecompensaPorAdocao(
    usuarioId: number,
    prisma: Prisma.TransactionClient,
  ) {
    if (!(await this.isGamificacaoAtiva())) {
      return;
    }

    this.logger.log(`Processando recompensas de adoção para o usuário ID: ${usuarioId}`);

    // 1. Conceder 200 pontos pela adoção
    await this.adicionarPontos(usuarioId, 200, prisma);

    // 2. Verificar se o usuário deve ganhar a medalha "Salvador de Vidas"
    const totalAdocoesAprovadas = await prisma.adocao.count({
      where: {
        usuarioId: usuarioId,
        status: StatusAdocao.APROVADA,
      },
    });

    // Concede a medalha apenas se esta for a primeira adoção aprovada do usuário
    if (totalAdocoesAprovadas === 1) {
      await this.verificarEAdicionarConquista(usuarioId, 'Salvador de Vidas', prisma);
    }
  }

  // ===================================================================
  // MÉTODOS DE CONSULTA (para o Frontend)
  // ===================================================================

  /**
   * Busca todas as conquistas que um usuário específico ganhou.
   * Inclui os detalhes de cada conquista (nome, ícone, etc.).
   * @param usuarioId O ID do usuário.
   */
  async findConquistasByUsuario(usuarioId: number) {
    this.logger.log(`Buscando conquistas para o usuário ID: ${usuarioId}`);
    return this.prisma.usuarioConquista.findMany({
      where: { usuarioId: usuarioId },
      include: {
        conquista: true,
      },
      orderBy: {
        dataDeGanho: 'desc',
      },
    });
  }

  // ===================================================================
  // MÉTODOS INTERNOS (Blocos de construção da gamificação)
  // ===================================================================

  /**
   * Adiciona uma quantidade de pontos a um usuário.
   * Pode ser executado dentro de uma transação do Prisma.
   */
  async adicionarPontos(
      usuarioId: number,
      pontos: number,
      prismaClient: Prisma.TransactionClient | PrismaService = this.prisma
    ): Promise<void> {
    if (!(await this.isGamificacaoAtiva()) || !usuarioId) {
      return;
    }
    this.logger.log(`Adicionando ${pontos} pontos ao usuário ${usuarioId}`);
    await prismaClient.usuario.update({
      where: { id: usuarioId },
      data: {
        pontos: {
          increment: pontos,
        },
      },
    });
  }

  /**
   * Verifica se um usuário já possui uma conquista e, caso não, a atribui.
   * Pode ser executado dentro de uma transação do Prisma.
   */
  async verificarEAdicionarConquista(
    usuarioId: number,
    nomeConquista: string,
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma
  ): Promise<void> {
    if (!(await this.isGamificacaoAtiva()) || !usuarioId) {
      return;
    }
    const conquista = await prismaClient.conquista.findUnique({
      where: { nome: nomeConquista },
    });

    if (!conquista) {
      this.logger.warn(`Conquista "${nomeConquista}" não encontrada no banco de dados.`);
      return;
    }

    const possuiConquista = await prismaClient.usuarioConquista.findUnique({
      where: {
        usuarioId_conquistaId: {
          usuarioId: usuarioId,
          conquistaId: conquista.id,
        },
      },
    });

    if (!possuiConquista) {
      this.logger.log(`Atribuindo conquista "${nomeConquista}" ao usuário ${usuarioId}`);
      await prismaClient.usuarioConquista.create({
        data: {
          usuarioId: usuarioId,
          conquistaId: conquista.id,
        },
      });

      if (conquista.pontosBonus > 0) {
        await this.adicionarPontos(usuarioId, conquista.pontosBonus, prismaClient);
      }
    }
  }

  private async isGamificacaoAtiva(): Promise<boolean> {
    const config = await this.prisma.configuracao.findUnique({
      where: { id: 1 },
    });
    return config?.gamificacaoAtiva ?? false;
  }

  // ===================================================================
  // MÉTODOS DE GESTÃO DE CONQUISTAS (CRUD para Admins)
  // ===================================================================

  async create(createConquistaDto: CreateConquistaDto) {
    return this.prisma.conquista.create({
      data: createConquistaDto,
    });
  }

  async findAll() {
    return this.prisma.conquista.findMany({
        orderBy: { id: 'asc' }
    });
  }

  async findOne(id: number) {
    const conquista = await this.prisma.conquista.findUnique({ where: { id } });
    if (!conquista) {
      throw new NotFoundException(`Conquista com ID ${id} não encontrada.`);
    }
    return conquista;
  }

  async update(id: number, updateConquistaDto: UpdateConquistaDto) {
    await this.findOne(id);
    return this.prisma.conquista.update({
      where: { id },
      data: updateConquistaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.conquista.delete({ where: { id } });
  }
}