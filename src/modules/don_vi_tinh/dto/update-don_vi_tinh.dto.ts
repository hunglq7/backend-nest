import { PartialType } from '@nestjs/mapped-types';
import { CreateDonViTinhDto } from './create-don_vi_tinh.dto';

export class UpdateDonViTinhDto extends PartialType(CreateDonViTinhDto) {}
