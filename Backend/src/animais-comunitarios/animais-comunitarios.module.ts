import { Module } from '@nestjs/common';
import { AnimaisComunitariosService } from './animais-comunitarios.service';
import { AnimaisComunitariosController } from './animais-comunitarios.controller';
import { UploadModule } from 'src/uploads-s3/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [AnimaisComunitariosController],
  providers: [AnimaisComunitariosService],
})
export class AnimaisComunitariosModule {}
