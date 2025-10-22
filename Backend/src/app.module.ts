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
import { ConteudoHomeModule } from './conteudo-home/conteudo-home.module';
import { ParceirosModule } from './parceiros/parceiros.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { GamificacaoModule } from './gamificacao/gamificacao.module';
import { ConfiguracaoModule } from './configuracao/configuracao.module';
import { AnimaisComunitariosModule } from './animais-comunitarios/animais-comunitarios.module';
import { GeocodingModule } from './geocoding/geocoding.module';
import { UploadModule } from './uploads-s3/upload.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsuarioModule,
    VoluntarioModule,
    DoacaoModule,
    AuthModule,
    SlideModule,
    AnimalModule,
    AdocoesModule,
    DivulgacaoModule,
    ConteudoHomeModule,
    ParceirosModule,
    DashboardModule,
    ReportsModule,
    GamificacaoModule,
    ConfiguracaoModule,
    AnimaisComunitariosModule,
    GeocodingModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
