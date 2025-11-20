// handlers/reaction-event.handler.ts
import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from '../services/socket-auth.service';
import { MessagesService } from '../services/message.service';

@Injectable()
export class ReactionEventHandler {
  constructor(private messagesService: MessagesService) {}

  async handleAddReaction(
    client: AuthenticatedSocket,
    data: { roomId: string; messageId: number; emoji: string },
  ) {
    const { roomId, messageId, emoji } = data;
    const userId = +client.data.userId;

    try {
      await this.messagesService.addReaction(messageId, userId, emoji);

      // Broadcast to everyone in the room (including sender)
      client.to(roomId).emit('reaction-added', {
        messageId,
        userId,
        emoji,
        timestamp: new Date(),
      });

      // Also emit to sender
      client.emit('reaction-added', {
        messageId,
        userId,
        emoji,
        timestamp: new Date(),
      });
    } catch {
      client.emit('error', { message: 'Failed to add reaction' });
    }
  }

  async handleRemoveReaction(
    client: AuthenticatedSocket,
    data: { roomId: string; messageId: number; emoji: string },
  ) {
    const { roomId, messageId, emoji } = data;
    const userId = +client.data.userId;

    try {
      await this.messagesService.removeReaction(messageId, userId, emoji);

      client.to(roomId).emit('reaction-removed', {
        messageId,
        userId,
        emoji,
        timestamp: new Date(),
      });

      // Also emit to sender
      client.emit('reaction-removed', {
        messageId,
        userId,
        emoji,
        timestamp: new Date(),
      });
    } catch {
      client.emit('error', { message: 'Failed to remove reaction' });
    }
  }
}
