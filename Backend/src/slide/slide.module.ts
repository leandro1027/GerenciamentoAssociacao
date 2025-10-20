import { Module } from '@nestjs/common';
import { SlideService } from './slide.service';
import { SlideController } from './slide.controller';
import { UploadModule } from 'src/uploads-s3/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [SlideController],
  providers: [SlideService],
})
export class SlideModule {}
