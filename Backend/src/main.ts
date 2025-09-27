import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Habilita o CORS para permitir que o frontend aceda à API
  app.enableCors();

  // Habilita validações globais para todos os DTOs em toda a aplicação
  app.useGlobalPipes(new ValidationPipe());



app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads',
});


  // Inicia a aplicação na porta definida no .env ou na porta 3001 por defeito
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();

