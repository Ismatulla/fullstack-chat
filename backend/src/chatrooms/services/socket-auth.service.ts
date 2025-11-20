import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: number;
    email: string;
  };
}

@Injectable()
export class SocketAuthService {
  constructor(private jwtService: JwtService) {}

  async authenticateSocket(
    client: Socket,
  ): Promise<{ userId: number; email: string }> {
    const cookieToken = this.extractCookie(
      client.handshake.headers.cookie,
      'accessToken',
    );
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : undefined;
    const queryParam = client.handshake.query?.token;
    const queryToken =
      typeof queryParam === 'string'
        ? queryParam
        : Array.isArray(queryParam)
          ? queryParam[0]
          : undefined;
    const bearerToken = client.handshake.headers.authorization
      ?.split(' ')
      .at(1);

    const token = cookieToken || authToken || bearerToken || queryToken;

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;
      return {
        userId,
        email: payload.email,
      };
    } catch (err) {
      console.log(err, 'token error');
      throw new UnauthorizedException('Invalid token');
    }
  }

  attachUserToSocket(client: Socket, userId: number, email: string): void {
    client.data.userId = userId;
    client.data.email = email;
  }

  private extractCookie(cookieHeader: string | undefined, key: string) {
    if (!cookieHeader) {
      return null;
    }
    const cookies = cookieHeader.split(';').map((part) => part.trim());
    const match = cookies.find((cookie) => cookie.startsWith(`${key}=`));
    if (!match) {
      return null;
    }
    return decodeURIComponent(match.split('=').slice(1).join('='));
  }
}
