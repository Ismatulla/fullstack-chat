import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../services/socket-auth.service';
import { PresenceService } from '../services/presence.service';
// import { RoomAccessService } from '../services/room-access.service';

@Injectable()
export class RoomEventHandler {
  async handleJoinRoom(
    server: Server,
    client: AuthenticatedSocket,
    data: { roomId: string },
    presence: PresenceService,
    // roomAccess: RoomAccessService,
  ) {
    console.log('JOIN ROOM HANDLER REACHED', data);
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    const { roomId } = data;

    if (!roomId) {
      client.emit('error', {
        message: 'roomId is required',
        received: data,
      });
      return;
    }
    const userId = client.data.userId;

    try {
      // await roomAccess.verifyAccess(Number(roomId), Number(userId));
      await client.join(roomId);
      presence.joinRoom(client.id, roomId);

      client.to(roomId).emit('user-joined', {
        userId,
        email: client.data.email,
        roomId,
        timestamp: new Date(),
      });
      // confirm to user
      client.emit('joined-room', {
        roomId,
        message: 'Successfully joined the room',
      });

      // Send current users list
      await this.handleGetRoomUsers(server, client, { roomId });
    } catch (error) {
      client.emit('error', {
        message: error.message || 'Failed to join room',
        roomId,
      });
    }
  }

  async handleLeaveRoom(
    client: AuthenticatedSocket,
    data: { roomId: string },
    presence: PresenceService,
  ) {
    const { roomId } = data;
    const userId = client.data.userId;

    await client.leave(roomId);
    presence.leaveRoom(client.id, roomId);

    client.to(roomId).emit('user-left', {
      userId,
      email: client.data.email,
      roomId,
      timestamp: new Date(),
    });
  }

  async handleGetRoomUsers(
    server: Server,
    client: AuthenticatedSocket,
    data: { roomId: string },
  ) {
    const { roomId } = data;
    const socketsInRoom = await server.in(roomId).fetchSockets();

    const users = socketsInRoom.map((socket: any) => ({
      userId: socket.data.userId,
      email: socket.data.email,
      status: 'online',
    }));
    client.emit('room-users', {
      roomId,
      users,
      count: users.length,
    });
  }
}
