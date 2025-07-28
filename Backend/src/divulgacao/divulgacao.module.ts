import { Module } from '@nestjs/common';
import { DivulgacaoService } from './divulgacao.service';
import { DivulgacaoController } from './divulgacao.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnimalModule } from 'src/animal/animal.module';
import { AnimalService } from 'src/animal/animal.service';

@Module({
  imports: [PrismaModule, AnimalModule],
  controllers: [DivulgacaoController],
  providers: [DivulgacaoService, AnimalService],
})
export class DivulgacaoModule {}
