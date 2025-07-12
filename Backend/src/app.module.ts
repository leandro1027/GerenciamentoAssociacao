import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { DoacaoModule } from 'src/doacao/doacao.module';
import { VoluntarioModule } from 'src/voluntario/voluntario.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UsuarioModule, DoacaoModule, VoluntarioModule,PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
