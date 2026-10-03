import { IsInt, Min } from "class-validator";

export class AssignUserRoleDto {
  @IsInt()
  @Min(1)
  idUser: number;

  @IsInt()
  @Min(1)
  idRole: number;
}
