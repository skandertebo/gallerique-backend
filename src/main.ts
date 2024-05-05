import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
dotenv.config();
async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule, {
    cors: true,
    rawBody: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT, () => {
    Logger.log(`Server running on http://localhost:${PORT}`);
  });
}
bootstrap();
