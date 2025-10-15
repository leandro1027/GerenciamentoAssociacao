import { Module } from '@nestjs/common';
import { DivulgacaoService } from './divulgacao.service';
import { DivulgacaoController } from './divulgacao.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnimalModule } from 'src/animal/animal.module';
import { AnimalService } from 'src/animal/animal.service';
import { GamificacaoModule } from 'src/gamificacao/gamificacao.module';

@Module({
  imports: [PrismaModule, AnimalModule, GamificacaoModule],
  controllers: [DivulgacaoController],
  providers: [DivulgacaoService, AnimalService],
})
export class DivulgacaoModule {}
