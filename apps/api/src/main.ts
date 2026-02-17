import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
  });
  await app.listen(process.env.port ?? 3050);
}
bootstrap();
