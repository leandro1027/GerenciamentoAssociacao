import { Module } from '@nestjs/common';
import { ConteudoHomeService } from './conteudo-home.service';
import { ConteudoHomeController } from './conteudo-home.controller';

@Module({
  controllers: [ConteudoHomeController],
  providers: [ConteudoHomeService],
})
export class ConteudoHomeModule {}
