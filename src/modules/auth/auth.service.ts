import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { Repository } from 'typeorm';
import { Users } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';

interface AccessTokenPayload {
  sub: number;
  email: string;
}

interface RefreshTokenPayload extends AccessTokenPayload {
  type: 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.findUserWithCredentials(loginDto.email);
    if (!user || !user.passwordHash || !(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return this.issueTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token không phải refresh token');
    }

    const user = await this.findUserWithCredentialsById(payload.sub);
    if (!user || !user.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }

    return this.issueTokens(user);
  }

  async logout(refreshToken: string) {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      return { message: 'Đã đăng xuất' };
    }

    await this.userRepository.update(
      { id: payload.sub },
      { refreshTokenHash: null },
    );
    return { message: 'Đã đăng xuất' };
  }

  private async issueTokens(user: Users) {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email };
    const refreshPayload: RefreshTokenPayload = { ...payload, type: 'refresh' };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as StringValue,
    });
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as StringValue,
    });

    await this.userRepository.update(
      { id: user.id },
      { refreshTokenHash: await bcrypt.hash(refreshToken, 12) },
    );

    return { accessToken, refreshToken };
  }

  private findUserWithCredentials(email: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.passwordHash', 'user.refreshTokenHash'])
      .where('user.email = :email', { email })
      .getOne();
  }

  private findUserWithCredentialsById(id: number) {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect(['user.passwordHash', 'user.refreshTokenHash'])
      .where('user.id = :id', { id })
      .getOne();
  }
}
