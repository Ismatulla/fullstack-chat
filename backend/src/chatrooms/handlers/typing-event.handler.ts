import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from '../services/socket-auth.service';

@Injectable()
export class TypingEventHandler {
  handleTyping(
    client: AuthenticatedSocket,
    data: { roomId: string; isTyping: boolean },
  ) {
    const { roomId, isTyping } = data;
    const userId = client.data.userId;
    const email = client.data.email;

    client.to(roomId).emit('user-typing', {
      userId,
      email,
      roomId,
      isTyping,
    });
  }
}
