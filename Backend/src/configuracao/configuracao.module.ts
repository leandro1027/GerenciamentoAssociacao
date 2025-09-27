import { Module } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { ConfiguracaoController } from './configuracao.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], 
  controllers: [ConfiguracaoController],
  providers: [ConfiguracaoService],
})
export class ConfiguracaoModule {}