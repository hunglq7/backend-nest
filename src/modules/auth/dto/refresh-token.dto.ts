import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token không được để trống' })
  @IsJWT({ message: 'Refresh token không hợp lệ' })
  refreshToken: string;
}
