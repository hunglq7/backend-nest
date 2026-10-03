import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: "Tên vai trò không được để trống" })
  @MaxLength(50)
  name: string;
}
