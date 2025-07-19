import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
   const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // As imagens estarão acessíveis em /uploads/nome_do_ficheiro.png
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
