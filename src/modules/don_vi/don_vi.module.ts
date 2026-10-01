import { Module } from '@nestjs/common';
import { DonViService } from './don_vi.service';
import { DonViController } from './don_vi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonVi } from './entities/don_vi.entity';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [TypeOrmModule.forFeature([DonVi]),AuthModule],
  controllers: [DonViController],
  providers: [DonViService],
})
export class DonViModule {}
