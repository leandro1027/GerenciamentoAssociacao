import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; // <-- Importa o Cron
import { GamificacaoService } from './gamificacao.service';

@Injectable()
export class GamificacaoTasksService {
  private readonly logger = new Logger(GamificacaoTasksService.name);

  constructor(private readonly gamificacaoService: GamificacaoService) {}

  /**
   * handleResetMensalRanking()
   * Esta função será executada automaticamente.
   * CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT
   * significa exatamente o que diz: à meia-noite do primeiro dia de cada mês.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleResetMensalRanking() {
    this.logger.warn('*** CRON JOB INICIADO: Resetando ranking mensal... ***');
    
    // Verifica se a gamificação está ativa antes de rodar
    const isAtiva = await this.gamificacaoService.isGamificacaoAtiva();
    if (isAtiva) {
      await this.gamificacaoService.resetarRankingGeral();
    } else {
      this.logger.warn('Gamificação está desativada. O reset mensal foi pulado.');
    }
  }
}
