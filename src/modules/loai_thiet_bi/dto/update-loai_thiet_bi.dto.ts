import { PartialType } from '@nestjs/mapped-types';
import { CreateLoaiThietBiDto } from './create-loai_thiet_bi.dto';

export class UpdateLoaiThietBiDto extends PartialType(CreateLoaiThietBiDto) {}
