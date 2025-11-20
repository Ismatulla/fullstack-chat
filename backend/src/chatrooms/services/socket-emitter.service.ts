import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketEmitterService {
  emitToRoom(server: Server, roomId: string, event: string, data: any): void {
    server.to(roomId).emit(event, data);
  }

  emitToUser(server: Server, socketId: string, event: string, data: any): void {
    server.to(socketId).emit(event, data);
  }

  emitAll(server: Server, event: string, data: any): void {
    server.emit(event, data);
  }

  emitToRoomExceptSender(
    client: Socket,
    roomId: string,
    event: string,
    data: any,
  ): void {
    client.to(roomId).emit(event, data);
  }

  emitError(client: Socket, message: string, details?: any): void {
    client.emit('error', {
      message,
      ...details,
      timestamp: new Date(),
    });
  }

  emitSuccess(client: Socket, message: string, data?: any): void {
    client.emit('success', {
      message,
      ...data,
      timestamp: new Date(),
    });
  }
}
