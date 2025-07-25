import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuarioModule } from './usuario/usuario.module';
import { VoluntarioModule } from './voluntario/voluntario.module';
import { DoacaoModule } from './doacao/doacao.module';
import { AuthModule } from './auth/auth.module';
import { SlideModule } from './slide/slide.module';
import { AnimalModule } from './animal/animal.module';
import { AdocoesModule } from './adocoes/adocoes.module';
import { DivulgacaoModule } from './divulgacao/divulgacao.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsuarioModule,
    VoluntarioModule,
    DoacaoModule,
    AuthModule,
    SlideModule,
    AnimalModule,
    AdocoesModule,
    DivulgacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
