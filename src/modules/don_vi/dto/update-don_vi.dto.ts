import { PartialType } from '@nestjs/mapped-types';
import { CreateDonViDto } from './create-don_vi.dto';

export class UpdateDonViDto extends PartialType(CreateDonViDto) {}
