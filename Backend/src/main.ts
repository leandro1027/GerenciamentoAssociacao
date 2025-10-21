import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🔧 Configuração completa de CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', // Durante o desenvolvimento local
      'https://gerenciamento-associacao.vercel.app/', // ⚠️ substitua pelo domínio real do Render
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // necessário se usar cookies ou headers personalizados
  });

  // 🔒 Pipes globais de validação
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // 📁 Servir pasta uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  console.log('Uploads servidos de:', join(process.cwd(), 'uploads'));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
