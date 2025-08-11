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
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { StatsModule } from './stats/stats.module';

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
    ConteudoHomeModule,
    ParceirosModule,
    CloudinaryModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
