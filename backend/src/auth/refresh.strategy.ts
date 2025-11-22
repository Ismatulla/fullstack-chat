import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface Payload {
  sub: string;
  email: string;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    const cookieExtractor = (req: Request) => req?.cookies?.refreshToken;
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH')!,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: Payload) {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.get('Authorization')?.replace('Bearer', '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return {
      userId: Number(payload.sub),
      email: payload.email,
      refreshToken,
    };
  }
}
