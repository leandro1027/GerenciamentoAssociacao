import { Module } from '@nestjs/common';
import { AdocoesService } from './adocoes.service';
import { AdocoesController } from './adocoes.controller';
import { GamificacaoModule } from 'src/gamificacao/gamificacao.module';

@Module({
  imports: [GamificacaoModule],
  controllers: [AdocoesController],
  providers: [AdocoesService],
})
export class AdocoesModule {}
