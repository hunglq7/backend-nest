import { IsNotEmpty, IsString, Length } from "class-validator";
export class CreateViTriLapDatDto {
  @IsNotEmpty({ message: "Mã vị trí lắp đặt không được trống" })
  @IsString()
  @Length(7, 7, { message: "Mã vị trí lắp đặt phải có đúng 7 ký tự" })
  ma_vi_tri_lap_dat: string;

  @IsNotEmpty({ message: "Vị trí lắp đặt không được trống" })
  @IsString()
  ten_vi_tri: string;
}
