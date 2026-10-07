import { IsNotEmpty, IsString, IsOptional } from "class-validator";
export class CreateThietBiDto {
  @IsNotEmpty({ message: "Tên đơn vị không được trống" })
  @IsString()
  name: string;
}
