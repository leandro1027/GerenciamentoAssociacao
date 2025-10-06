import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  // --- CORRIGIDO AQUI ---
  // Adiciona as opções ao ValidationPipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Ativa a transformação automática de tipos
    whitelist: true, // Remove campos que não estão no DTO
  }));

  // Serve a pasta uploads direto da raiz do projeto
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  console.log('Uploads servidos de:', join(process.cwd(), 'uploads'));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();