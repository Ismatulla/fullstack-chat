// handlers/message-event.handler.ts
import { Injectable } from '@nestjs/common';

import { AuthenticatedSocket } from '../services/socket-auth.service';
import { MessagesService } from '../services/message.service';

@Injectable()
export class MessageEventHandler {
  constructor(private messagesService: MessagesService) {}

  async handleSendMessage(
    client: AuthenticatedSocket,
    data: { roomId: string; message: string; tempId?: string },
  ) {
    const { roomId, message, tempId } = data;
    const userId = +client.data.userId;
    const email = client.data.email;

    try {
      const savedMessage = await this.messagesService.create(
        message,
        userId,
        Number(roomId),
      );

      const messageData = {
        id: savedMessage?.id,
        roomId,
        message: savedMessage?.content,
        userId,
        email,
        timestamp: savedMessage?.createdAt,
        status: 'sent',
      };

      // Send to others in the room (exclude sender)
      client.to(roomId).emit('new-message', messageData);

      // Confirm to sender
      client.emit('message-sent', {
        ...messageData,
        tempId, // For optimistic UI updates
      });
    } catch {
      client.emit('message-error', {
        error: 'Failed to send message',
        tempId,
      });
    }
  }

  async handleMessageRead(
    client: AuthenticatedSocket,
    data: { roomId: string; messageId: number },
  ) {
    const { roomId, messageId } = data;
    const userId = +client.data.userId;

    try {
      await this.messagesService.markAsRead(messageId, userId);

      // Notify others in the room
      client.to(roomId).emit('message-status', {
        messageId,
        userId,
        status: 'read',
        timestamp: new Date(),
      });
    } catch {
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }
}
