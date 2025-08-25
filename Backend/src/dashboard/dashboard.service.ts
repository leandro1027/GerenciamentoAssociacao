import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusAdocao, StatusAnimal, DivulgacaoStatus } from 'generated/prisma';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [stats, weeklyActivity, recentActivities] = await Promise.all([
      this.getStats(),
      this.getWeeklyActivity(),
      this.getRecentActivities(),
    ]);

    return {
      stats,
      weeklyActivity,
      recentActivities,
    };
  }

  /**
   * Busca as estatísticas principais (contagens).
   */
  private async getStats() {
    const [pedidosPendentes, divulgacoesPendentes, animaisDisponiveis, totalMembros] = await this.prisma.$transaction([
      this.prisma.adocao.count({ where: { status: StatusAdocao.SOLICITADA } }),
      this.prisma.divulgacao.count({ where: { status: DivulgacaoStatus.PENDENTE } }),
      this.prisma.animal.count({ where: { status: StatusAnimal.DISPONIVEL } }),
      this.prisma.usuario.count(),
    ]);

    return {
      pedidosPendentes,
      divulgacoesPendentes,
      animaisDisponiveis,
      totalMembros,
    };
  }

  /**
   * Busca as atividades recentes (últimas adoções e voluntários pendentes).
   */
  private async getRecentActivities() {
    const [adocoes, voluntarios] = await this.prisma.$transaction([
      this.prisma.adocao.findMany({
        where: { status: StatusAdocao.SOLICITADA },
        take: 2,
        orderBy: { dataSolicitacao: 'desc' },
        include: {
          usuario: { select: { nome: true } },
          animal: { select: { nome: true } },
        },
      }),
      this.prisma.voluntario.findMany({
        where: { status: 'pendente' },
        take: 2,
        orderBy: { id: 'desc' }, // Usando 'id' como fallback para ordenação
        include: {
          usuario: { select: { nome: true } },
        },
      }),
    ]);
    return { adocoes, voluntarios };
  }

  /**
   * Calcula a atividade de adoções e divulgações dos últimos 7 dias.
   */
  private async getWeeklyActivity() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Zera a hora para pegar o dia inteiro

    // Busca os registros dos últimos 7 dias
    const [adocoes, divulgacoes] = await this.prisma.$transaction([
        this.prisma.adocao.findMany({
            where: { dataSolicitacao: { gte: sevenDaysAgo } },
            select: { dataSolicitacao: true },
        }),
        this.prisma.divulgacao.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true },
        })
    ]);

    // Mapeia os dados por dia
    const activityByDay = new Map<string, { NovasAdoções: number; NovasDivulgações: number }>();

    adocoes.forEach(a => {
        const day = a.dataSolicitacao.toISOString().split('T')[0];
        const current = activityByDay.get(day) || { NovasAdoções: 0, NovasDivulgações: 0 };
        current.NovasAdoções++;
        activityByDay.set(day, current);
    });

    divulgacoes.forEach(d => {
        const day = d.createdAt.toISOString().split('T')[0];
        const current = activityByDay.get(day) || { NovasAdoções: 0, NovasDivulgações: 0 };
        current.NovasDivulgações++;
        activityByDay.set(day, current);
    });
    
    // Formata a saída para o gráfico
    // CORRIGIDO: Adicionada a tipagem explícita para a matriz 'result'
    const result: { name: string; NovasAdoções: number; NovasDivulgações: number; }[] = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        
        const data = activityByDay.get(dayKey) || { NovasAdoções: 0, NovasDivulgações: 0 };
        
        result.push({
            name: dayName,
            ...data,
        });
    }

    return result;
  }
}
