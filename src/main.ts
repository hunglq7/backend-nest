import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { mkdirSync } from "fs";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const avatarDirectory = join(process.cwd(), "public", "image");
  mkdirSync(avatarDirectory, { recursive: true });
  app.useStaticAssets(avatarDirectory, { prefix: "/image/" });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại địa chỉ: http://localhost:${port}`);
}
bootstrap();
