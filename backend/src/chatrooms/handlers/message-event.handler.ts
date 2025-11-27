// handlers/message-event.handler.ts
import { Injectable } from '@nestjs/common';

import { AuthenticatedSocket } from '../services/socket-auth.service';
import { MessagesService } from '../services/message.service';
import { Server } from 'socket.io';

@Injectable()
export class MessageEventHandler {
  constructor(private messagesService: MessagesService) { }

  async handleSendMessage(
    server: Server,
    client: AuthenticatedSocket,
    data: { roomId: string; content: string; tempId?: string },
  ) {
    const { roomId, content, tempId } = data;
    const userId = +client.data.userId;
    const email = client.data.email;

    try {
      const savedMessage = await this.messagesService.create(
        content,
        userId,
        Number(roomId),
      );

      const messageData = {
        id: savedMessage?.id,
        roomId,
        content: savedMessage?.content,
        userId,
        email,
        timestamp: savedMessage?.createdAt,
        status: 'sent',
      };

      // Broadcast to ALL clients (for sidebar updates)
      server.emit('new-message', messageData);

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
      const receipt = await this.messagesService.markAsRead(messageId, userId);

      if (receipt) {
        // Notify others in the room
        client.to(roomId).emit('message-status', {
          messageId,
          userId,
          user: receipt.user,
          status: 'read',
          timestamp: receipt.readAt,
        });
      }
    } catch {
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  async handleMarkRoomRead(
    client: AuthenticatedSocket,
    data: { roomId: string },
  ) {
    const { roomId } = data;
    const userId = +client.data.userId;

    try {
      const receipts = await this.messagesService.markRoomAsRead(Number(roomId), userId);

      if (receipts && receipts.length > 0) {
        // Notify others in the room for EACH message marked as read
        // This restores the "Seen by" functionality
        receipts.forEach(receipt => {
          client.to(roomId).emit('message-status', {
            messageId: receipt.message.id,
            userId,
            user: receipt.user,
            status: 'read',
            timestamp: receipt.readAt,
          });
        });
      }
    } catch (error) {
      console.error('Failed to mark room as read:', error);
    }
  }

  async handleEditMessage(
    client: AuthenticatedSocket,
    data: { roomId: string; messageId: number; content: string },
  ) {
    const { roomId, messageId, content } = data;
    const userId = +client.data.userId;

    try {
      const updatedMessage = await this.messagesService.editMessage(messageId, userId, content);

      // Broadcast update
      client.to(roomId).emit('message-updated', {
        id: updatedMessage.id,
        content: updatedMessage.content,
        isEdited: true,
        editedAt: updatedMessage.editedAt,
        roomId: roomId
      });

      // Also emit to sender (to confirm update)
      client.emit('message-updated', {
        id: updatedMessage.id,
        content: updatedMessage.content,
        isEdited: true,
        editedAt: updatedMessage.editedAt,
        roomId: roomId
      });

    } catch (error) {
      console.error('Failed to edit message:', error);
      client.emit('error', { message: 'Failed to edit message' });
    }
  }

  async handleDeleteMessage(
    client: AuthenticatedSocket,
    data: { roomId: string; messageId: number },
  ) {
    const { roomId, messageId } = data;
    const userId = +client.data.userId;

    try {
      await this.messagesService.deleteMessage(messageId, userId);

      // Broadcast delete
      client.to(roomId).emit('message-deleted', { messageId, roomId });
      client.emit('message-deleted', { messageId, roomId });

    } catch (error) {
      console.error('Failed to delete message:', error);
      client.emit('error', { message: 'Failed to delete message' });
    }
  }

  async handleClearRoom(
    client: AuthenticatedSocket,
    data: { roomId: string },
  ) {
    const { roomId } = data;
    const userId = +client.data.userId;

    try {
      await this.messagesService.clearRoomMessages(Number(roomId), userId);

      // Broadcast clear
      client.to(roomId).emit('room-cleared', { roomId });
      client.emit('room-cleared', { roomId });

    } catch (error) {
      console.error('Failed to clear room:', error);
      client.emit('error', { message: 'Failed to clear room' });
    }
  }
}
