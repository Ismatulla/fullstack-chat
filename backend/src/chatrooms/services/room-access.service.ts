import { Injectable, ForbiddenException } from '@nestjs/common';
import { ChatroomsService } from './chatrooms.service';

@Injectable()
export class RoomAccessService {
  constructor(private chatroomsService: ChatroomsService) {}

  async verifyAccess(roomId: number, userId: number): Promise<void> {
    const hasAccess = await this.chatroomsService.verifyUserAccess(
      roomId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this room');
    }
  }
  async canJoinRoom(roomId: number, userId: number): Promise<boolean> {
    try {
      await this.verifyAccess(roomId, userId);
      return true;
    } catch {
      return false;
    }
  }
}
