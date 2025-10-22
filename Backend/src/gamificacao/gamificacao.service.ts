import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConquistaDto } from './dto/create-conquista.dto';
import { UpdateConquistaDto } from './dto/update-conquista.dto';
import { Prisma, StatusAdocao, StatusDoacao, DivulgacaoStatus } from '@prisma/client';

export interface LoginHistoryStatus {
  data: Date;
  status: 'completed' | 'missed';
}

@Injectable()
export class GamificacaoService {
  private readonly logger = new Logger(GamificacaoService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ===================================================================
  // MÉTODOS DE LÓGICA DE NEGÓCIO (REGRAS DE RECOMPENSA)
  // ===================================================================

  async processarRecompensaPorDoacao(
    usuarioId: number,
    valorDoacao: number,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    if (!(await this.isGamificacaoAtiva())) {
      this.logger.warn('Gamificação desativada. Recompensa por doação ignorada.');
      return;
    }
    this.logger.log(`[DOAÇÃO] Iniciando processamento para usuário ID: ${usuarioId}`);

    const pontosGanhos = Math.floor(valorDoacao);
    if (pontosGanhos > 0) {
      await this.adicionarPontos(usuarioId, pontosGanhos, prisma);
    }

    // Lógica 1: Verifica a conquista de "Primeiro Apoiador"
    const totalDoacoesConfirmadas = await prisma.doacao.count({
      where: {
        usuarioId: usuarioId,
        status: StatusDoacao.CONFIRMADA,
      },
    });
    this.logger.log(`[DOAÇÃO] Total de doações confirmadas para o usuário: ${totalDoacoesConfirmadas}`);

    if (totalDoacoesConfirmadas === 1) {
      this.logger.log('[DOAÇÃO] Condição de primeira doação atendida. Verificando conquista...');
      await this.verificarEAdicionarConquista(
        usuarioId,
        'Primeiro Apoiador',
        prisma,
      );
    } else {
      this.logger.warn(`[DOAÇÃO] Condição de primeira doação NÃO atendida (Total: ${totalDoacoesConfirmadas}).`);
    }

    // Lógica 2: Verifica a conquista "Anjo da Guarda"
    this.logger.log(`[DOAÇÃO] Verificando conquista 'Anjo da Guarda'...`);
    const agregacaoDoacoes = await prisma.doacao.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        usuarioId: usuarioId,
        status: StatusDoacao.CONFIRMADA,
      },
    });

    const valorTotalDoado = agregacaoDoacoes._sum.valor ?? 0;
    this.logger.log(`[DOAÇÃO] Valor total doado pelo usuário: R$ ${valorTotalDoado}`);

    if (valorTotalDoado >= 200) {
      this.logger.log(`[DOAÇÃO] Meta de R$200 atingida. Verificando se o usuário já possui a conquista...`);
      await this.verificarEAdicionarConquista(
        usuarioId,
        'Anjo da Guarda',
        prisma,
      );
    } else {
      this.logger.log(`[DOAÇÃO] Meta de R$200 ainda não atingida.`);
    }
  }

  async processarRecompensaPorAdocao(
    usuarioId: number,
    prisma: Prisma.TransactionClient,
  ) {
    if (!(await this.isGamificacaoAtiva())) {
      return;
    }
    this.logger.log(`Processando recompensas de adoção para o usuário ID: ${usuarioId}`);
    
    const totalAdocoesAprovadas = await prisma.adocao.count({
      where: {
        usuarioId: usuarioId,
        status: StatusAdocao.APROVADA,
      },
    });

    if (totalAdocoesAprovadas === 1) {
      await this.verificarEAdicionarConquista(usuarioId, 'Herói dos Peludos', prisma);
    }
  }

  async processarRecompensaPorVoluntariadoAprovado(
    usuarioId: number,
    prisma: Prisma.TransactionClient,
  ) {
    if (!(await this.isGamificacaoAtiva())) {
      return;
    }
    this.logger.log(`Processando recompensas de voluntariado para o usuário ID: ${usuarioId}`);
    await this.verificarEAdicionarConquista(
      usuarioId,
      'Coração Voluntário',
      prisma,
    );
  }

  async processarRecompensaPorDivulgacaoAprovada(
    usuarioId: number,
    prisma: Prisma.TransactionClient,
  ) {
    if (!(await this.isGamificacaoAtiva())) {
      return;
    }
    this.logger.log(`Processando recompensas de divulgação para o usuário ID: ${usuarioId}`);
    await this.verificarEAdicionarConquista(
      usuarioId,
      'Voz dos Sem Voz',
      prisma,
    );
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

  async getLoginHistory(usuarioId: number): Promise<LoginHistoryStatus[]> {
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    seteDiasAtras.setUTCHours(0, 0, 0, 0);

    const logins = await this.prisma.loginDiario.findMany({
      where: {
        usuarioId,
        data: {
          gte: seteDiasAtras,
        },
      },
      orderBy: {
        data: 'asc',
      },
    });

    const ultimosSeteDias: LoginHistoryStatus[] = [];
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
        status: loginDoDia ? 'completed' : 'missed',
      });
    }
    return ultimosSeteDias;
  }

  // ===================================================================
  // MÉTODOS INTERNOS E DE APOIO
  // ===================================================================

  async adicionarPontos(
    usuarioId: number,
    pontos: number,
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    if (!(await this.isGamificacaoAtiva()) || !usuarioId || pontos <= 0) {
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
    prismaClient: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    this.logger.log(`[CONQUISTA] Verificando '${nomeConquista}' para usuário ID: ${usuarioId}`);

    const conquista = await prismaClient.conquista.findUnique({
      where: { nome: nomeConquista },
    });

    if (!conquista) {
      this.logger.error(`[CONQUISTA] FALHA: Conquista com nome '${nomeConquista}' NÃO ENCONTRADA no banco. Verifique seu arquivo seed.ts.`);
      return;
    }
    this.logger.log(`[CONQUISTA] Conquista '${nomeConquista}' encontrada (ID: ${conquista.id})`);

    const possuiConquista = await prismaClient.usuarioConquista.findUnique({
      where: {
        usuarioId_conquistaId: {
          usuarioId: usuarioId,
          conquistaId: conquista.id,
        },
      },
    });

    if (possuiConquista) {
      this.logger.warn(`[CONQUISTA] Usuário já possui a conquista '${nomeConquista}'. Ignorando.`);
      return;
    }

    this.logger.log(`[CONQUISTA] Usuário NÃO possui a conquista. Tentando criar o registro...`);
    await prismaClient.usuarioConquista.create({
      data: {
        usuarioId: usuarioId,
        conquistaId: conquista.id,
      },
    });
    this.logger.log(`[CONQUISTA] SUCESSO: Conquista '${nomeConquista}' salva para o usuário ID: ${usuarioId}`);

    if (conquista.pontosBonus > 0) {
      await this.adicionarPontos(usuarioId, conquista.pontosBonus, prismaClient);
    }
  }

  public async isGamificacaoAtiva(): Promise<boolean> {
    const config = await this.prisma.configuracao.findUnique({
      where: { id: 1 },
    });
    return config?.gamificacaoAtiva ?? false;
  }

  async resetarRankingGeral(): Promise<void> {
    this.logger.log('INICIANDO RESET MENSAL DO RANKING...');
    
    try {
      // Usamos updateMany para atualizar todos os usuários de uma vez
      const { count } = await this.prisma.usuario.updateMany({
        where: {
          pontos: { gt: 0 } // Apenas atualiza quem tem pontos (otimização)
        },
        data: {
          pontos: 0 // Zera a pontuação
        },
      });

      this.logger.log(`RESET MENSAL CONCLUÍDO: ${count} usuários tiveram seus pontos zerados.`);

    } catch (error) {
      this.logger.error('Falha crítica ao tentar resetar o ranking mensal.', error.stack);
    }
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