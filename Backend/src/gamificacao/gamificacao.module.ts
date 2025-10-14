import { Module } from '@nestjs/common';
import { GamificacaoService } from './gamificacao.service';
import { GamificacaoController } from './gamificacao.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], 
  controllers: [GamificacaoController],
  providers: [GamificacaoService],
  exports: [GamificacaoService],
})
export class GamificacaoModule {}