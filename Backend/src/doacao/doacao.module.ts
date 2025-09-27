import { Module } from '@nestjs/common';
import { DoacaoService } from './doacao.service';
import { DoacaoController } from './doacao.controller';
import { GamificacaoModule } from 'src/gamificacao/gamificacao.module'; // <-- Verifique se esta linha existe

@Module({
  imports: [GamificacaoModule],
  controllers: [DoacaoController],
  providers: [DoacaoService],
})
export class DoacaoModule {}