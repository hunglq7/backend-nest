import { PartialType } from '@nestjs/mapped-types';
import { CreateKhuVucDto } from './create-khu_vuc.dto';

export class UpdateKhuVucDto extends PartialType(CreateKhuVucDto) {}
