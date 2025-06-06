import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
 async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
   app.enableCors({
     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
   }); 
   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
bootstrap();
