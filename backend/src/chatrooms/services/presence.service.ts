import { Injectable } from '@nestjs/common';

interface UserPresence {
  userId: string;
  rooms: Set<string>;
  socketId: string;
}

@Injectable()
export class PresenceService {
  private activeUsers = new Map<string, string>(); // userId socketId
  private userPresence = new Map<string, UserPresence>(); //socketId -> presence

  addUser(socketId: string, userId: string): void {
    this.activeUsers.set(userId, socketId);
    this.userPresence.set(socketId, {
      userId,
      rooms: new Set(),
      socketId,
    });
  }

  removeUser(socketId: string): UserPresence | undefined {
    const presence = this.userPresence.get(socketId);
    if (presence) {
      this.activeUsers.delete(socketId);
      this.userPresence.delete(socketId);
    }
    return presence;
  }

  joinRoom(socketId: string, roomId: string): void {
    const presence = this.userPresence.get(socketId);
    if (presence) {
      presence.rooms.delete(roomId);
    }
  }

  leaveRoom(socketId: string, roomId: string): void {
    const presence = this.userPresence.get(socketId);
    if (presence) presence.rooms.delete(roomId);
  }

  isUserOnline(userId: string): boolean {
    return this.activeUsers.has(userId);
  }

  getUserSocketId(userId: string): string | undefined {
    return this.activeUsers.get(userId);
  }

  getUserRooms(socketId: string): Set<string> {
    return this.userPresence.get(socketId)?.rooms || new Set();
  }

  getUserPresence(socketId: string): UserPresence | undefined {
    return this.userPresence.get(socketId);
  }
}
