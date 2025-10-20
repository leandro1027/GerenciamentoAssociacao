import { Module } from '@nestjs/common';
import { DoacaoService } from './doacao.service';
import { DoacaoController } from './doacao.controller';
import { GamificacaoModule } from 'src/gamificacao/gamificacao.module'; // <-- Verifique se esta linha existe
import { UploadModule } from 'src/uploads-s3/upload.module';

@Module({
  imports: [GamificacaoModule, UploadModule],
  controllers: [DoacaoController],
  providers: [DoacaoService],
})
export class DoacaoModule {}