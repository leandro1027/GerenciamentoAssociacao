import { Module } from '@nestjs/common';
import { GamificacaoService } from './gamificacao.service';
import { GamificacaoController } from './gamificacao.controller';

@Module({
  controllers: [GamificacaoController],
  providers: [GamificacaoService],
})
export class GamificacaoModule {}
