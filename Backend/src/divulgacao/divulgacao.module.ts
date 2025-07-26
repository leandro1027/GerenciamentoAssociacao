import { Module } from '@nestjs/common';
import { DivulgacaoService } from './divulgacao.service';
import { DivulgacaoController } from './divulgacao.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DivulgacaoController],
  providers: [DivulgacaoService],
})
export class DivulgacaoModule {}
