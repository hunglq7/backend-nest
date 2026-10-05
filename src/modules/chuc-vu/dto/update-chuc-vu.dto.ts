import { PartialType } from '@nestjs/mapped-types';
import { CreateChucVuDto } from './create-chuc-vu.dto';

export class UpdateChucVuDto extends PartialType(CreateChucVuDto) {}
