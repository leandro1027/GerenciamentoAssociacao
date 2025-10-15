import { Module } from '@nestjs/common';
import { VoluntarioService } from './voluntario.service';
import { VoluntarioController } from './voluntario.controller';
import { GamificacaoModule } from 'src/gamificacao/gamificacao.module';

@Module({
   imports: [GamificacaoModule], 
  controllers: [VoluntarioController],
  providers: [VoluntarioService],
})
export class VoluntarioModule {}
