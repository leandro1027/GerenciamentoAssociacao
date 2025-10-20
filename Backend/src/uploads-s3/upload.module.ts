import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Importe o ConfigModule para que o serviço possa usar o ConfigService
  providers: [UploadService],
  exports: [UploadService], // Exporte o serviço para ser usado em outros módulos
})
export class UploadModule {}