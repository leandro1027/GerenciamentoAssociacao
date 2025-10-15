import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { UpdateConquistaDto } from './dto/update-conquista.dto';
import { Prisma, StatusAdocao } from '@prisma/client';

// Interface para definir o tipo de retorno do histórico de login
export interface LoginHistoryStatus {
  data: Date;
  status: 'completed' | 'missed';
}

@Injectable()
export class GamificacaoService {
  private readonly logger = new Logger(GamificacaoService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ===================================================================
  // MÉTODOS DE LÓGICA DE NEGÓCIO
  // ===================================================================

  async processarRecompensaPorAdocao(
    usuarioId: number,
    prisma: Prisma.TransactionClient,
  ) {
    if (!(await this.isGamificacaoAtiva())) {
      return;
    }
    this.logger.log(`Processando recompensas de adoção para o usuário ID: ${usuarioId}`);
    await this.adicionarPontos(usuarioId, 200, prisma);

    const totalAdocoesAprovadas = await prisma.adocao.count({
      where: {
        usuarioId: usuarioId,
        status: StatusAdocao.APROVADA,
      },
    });

    if (totalAdocoesAprovadas === 1) {
      await this.verificarEAdicionarConquista(usuarioId, 'Salvador de Vidas', prisma);
    }
  }

  // ===================================================================
  // MÉTODOS DE CONSULTA (para o Frontend)
  // ===================================================================

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

  // gamificacao.service.ts
async getLoginHistory(usuarioId: number) {
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  seteDiasAtras.setUTCHours(0, 0, 0, 0);

  // Busca os logins dos últimos 7 dias
  const logins = await this.prisma.loginDiario.findMany({
    where: {
      usuarioId,
      data: {
        gte: seteDiasAtras
      }
    },
    orderBy: {
      data: 'asc'
    }
  });

  // Cria um array com os últimos 7 dias
  const ultimosSeteDias: { data: Date; status: 'completed' | 'missed' }[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    data.setUTCHours(0, 0, 0, 0);

    const loginDoDia = logins.find(login => {
      const loginDate = new Date(login.data);
      loginDate.setUTCHours(0, 0, 0, 0);
      return loginDate.getTime() === data.getTime();
    });

    ultimosSeteDias.push({
      data,
      status: loginDoDia ? 'completed' : 'missed'
    });
  }

  return ultimosSeteDias;
}


  // ===================================================================
  // MÉTODOS INTERNOS
  // ===================================================================

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
      this.logger.warn(`Conquista "${nomeConquista}" não encontrada.`);
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
    return this.prisma.conquista.create({ data: createConquistaDto });
  }

  async findAll() {
    return this.prisma.conquista.findMany({ orderBy: { id: 'asc' } });
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