import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';

import { User } from '../users/entities/user.entity';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto, res: Response) {
    const existing = await this.usersService.findByEmail(createUserDto.email);
    if (existing) throw new BadRequestException('User already exists');
    const user = await this.usersService.create(
      createUserDto.email,
      createUserDto.password,
      createUserDto.name,
    );
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      message: 'Registration successful',
      user: this.toSafeUser(user),
    };
  }
  async login(loginDto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      message: 'Login successful',
      user: this.toSafeUser(user),
    };
  }
  async logout(userId: number, res: Response) {
    await this.usersService.removeRefreshToken(userId);
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  async refresh(userId: number, refreshToken: string, res: Response) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.hashedRefreshToken) throw new UnauthorizedException();

    const valid = await this.usersService.validateRefreshToken(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!valid) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.setRefreshToken(user.id, tokens.refreshToken);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      message: 'Tokens refreshed',
      user: this.toSafeUser(user),
    };
  }
  private async generateTokens(id: number, email: string) {
    const payload = { sub: id, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH'),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
