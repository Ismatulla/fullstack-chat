import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../services/socket-auth.service';
import { PresenceService } from '../services/presence.service';

@Injectable()
export class PresenceEventHandler {
  handleUserDisconnect(server: Server, userId: string, rooms: Set<string>) {
    //Notify all rooms user was in
    rooms.forEach((roomId) => {
      server.to(roomId).emit('user-status', {
        userId,
        status: 'offline',
        roomId,
        timestamp: new Date(),
      });
    });

    // Broadcast offline status globally
    server.emit('user-status', {
      userId,
      status: 'offline',
      timestamp: new Date(),
    });
  }

  handleCheckStatus(
    client: AuthenticatedSocket,
    data: { userId: string },
    presence: PresenceService,
  ) {
    const isOnline = presence.isUserOnline(data.userId);

    client.emit('user-status-response', {
      userId: data.userId,
      status: isOnline ? 'online' : 'offline',
    });
  }
}
