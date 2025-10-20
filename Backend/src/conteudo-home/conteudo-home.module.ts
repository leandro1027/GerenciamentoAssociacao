import { Module } from '@nestjs/common';
import { ConteudoHomeService } from './conteudo-home.service';
import { ConteudoHomeController } from './conteudo-home.controller';
import { UploadModule } from 'src/uploads-s3/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [ConteudoHomeController],
  providers: [ConteudoHomeService],
})
export class ConteudoHomeModule {}
