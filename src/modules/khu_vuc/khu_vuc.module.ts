import { Module } from '@nestjs/common';
import { KhuVucService } from './khu_vuc.service';
import { KhuVucController } from './khu_vuc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhuVuc } from './entities/khu_vuc.entity';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [TypeOrmModule.forFeature([KhuVuc]),AuthModule],
  controllers: [KhuVucController],
  providers: [KhuVucService],
})
export class KhuVucModule {}
