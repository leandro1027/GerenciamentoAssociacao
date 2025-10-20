import { Module } from '@nestjs/common';
import { AnimalService } from './animal.service';
import { AnimalController } from './animal.controller';
import { UploadModule } from 'src/uploads-s3/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [AnimalController],
  providers: [AnimalService],
})
export class AnimalModule {}
