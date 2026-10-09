import { IsNotEmpty, IsString } from "class-validator";
export class CreateKhuVucDto {
  @IsNotEmpty({ message: "Tên khu vực không được trống" })
  @IsString()
  Tên_khu_vuc: string;
}
