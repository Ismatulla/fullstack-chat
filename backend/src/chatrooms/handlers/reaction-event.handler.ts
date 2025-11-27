// handlers/reaction-event.handler.ts
import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from '../services/socket-auth.service';
import { MessagesService } from '../services/message.service';

@Injectable()
export class ReactionEventHandler {
  constructor(private messagesService: MessagesService) { }

  async handleAddReaction(
    client: AuthenticatedSocket,
    data: { roomId: string; messageId: number; emoji: string },
  ) {
    const { roomId, messageId, emoji } = data;
    const userId = +client.data.userId;

    try {
      // Check if user had a previous reaction BEFORE adding the new one
      const allReactions = await this.messagesService.getReactionsByMessage(messageId);
      const userPreviousReaction = allReactions.find(r => r.user.id === userId);

      // Add the new reaction (this will remove the old one if it exists)
      await this.messagesService.addReaction(messageId, userId, emoji);

      // If user had a different reaction, emit remove event first
      if (userPreviousReaction && userPreviousReaction.emoji !== emoji) {
        console.log(`[Reaction] User ${userId} replacing ${userPreviousReaction.emoji} with ${emoji} on message ${messageId}`);

        client.to(roomId).emit('reaction-removed', {
          messageId,
          userId,
          emoji: userPreviousReaction.emoji,
          timestamp: new Date(),
        });
        client.emit('reaction-removed', {
          messageId,
          userId,
          emoji: userPreviousReaction.emoji,
          timestamp: new Date(),
        });
      }

      // Broadcast the new reaction to everyone in the room (including sender)
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
    } catch (error) {
      console.error('[Reaction] Failed to add reaction:', error);
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
