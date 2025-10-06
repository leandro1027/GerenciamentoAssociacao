import { Module } from '@nestjs/common';
import { AnimaisComunitariosService } from './animais-comunitarios.service';
import { AnimaisComunitariosController } from './animais-comunitarios.controller';

@Module({
  controllers: [AnimaisComunitariosController],
  providers: [AnimaisComunitariosService],
})
export class AnimaisComunitariosModule {}
