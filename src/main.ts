import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { mkdirSync } from "fs";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const corsOrigins = (
    process.env.CORS_ORIGINS ??
    "http://localhost:3000,http://127.0.0.1:3000,http://192.168.10.8:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

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
