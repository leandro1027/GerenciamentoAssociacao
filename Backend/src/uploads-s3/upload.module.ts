import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsService } from './upload.service';

@Module({
  imports: [ConfigModule], // Importe o ConfigModule para que o serviço possa usar o ConfigService
  providers: [UploadsService],
  exports: [UploadsService], // Exporte o serviço para ser usado em outros módulos
})
export class UploadModule {}