import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from "./modules/products/products.module";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { DonViModule } from "./modules/don_vi/don_vi.module";
import { ThietBiModule } from "./modules/thiet_bi/thiet_bi.module";
import { KhuVucModule } from "./modules/khu_vuc/khu_vuc.module";
import { RolesModule } from "./modules/roles/roles.module";
import { LoaiThietBiModule } from "./modules/loai_thiet_bi/loai_thiet_bi.module";
import { DonViTinhModule } from "./modules/don_vi_tinh/don_vi_tinh.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
      }),
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    DonViModule,
    ThietBiModule,
    KhuVucModule,
    RolesModule,
    LoaiThietBiModule,
    DonViTinhModule,
  ],
})
export class AppModule {}
