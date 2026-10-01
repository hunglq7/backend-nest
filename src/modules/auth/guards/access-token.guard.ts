import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface AccessTokenPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Cần cung cấp access token');
    }

    try {
      request.user = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('Access token không hợp lệ hoặc đã hết hạn');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
