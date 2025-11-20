import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    const error =
      exception instanceof WsException ? exception.getError() : exception;

    const errorMessage =
      typeof error === 'string'
        ? error
        : (error as any)?.message || 'Internal server error';

    client.emit('error', {
      message: errorMessage,
      timestamp: new Date(),
    });

    console.error('Websocket error', {
      error: errorMessage,
      clientId: client.id,
      timestamp: new Date(),
    });
  }
}
