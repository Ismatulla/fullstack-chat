// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  SocketAuthService,
  AuthenticatedSocket,
} from './services/socket-auth.service';
import { PresenceService } from './services/presence.service';
// import { RoomAccessService } from './services/room-access.service';
import { SocketEmitterService } from './services/socket-emitter.service';
import { WsExceptionFilter } from './ws-exception.filter';

// Event Handlers
import { RoomEventHandler } from './handlers/room-event.handler';
import { MessageEventHandler } from './handlers/message-event.handler';
import { TypingEventHandler } from './handlers/typing-event.handler';
import { ReactionEventHandler } from './handlers/reaction-event.handler';
import { PresenceEventHandler } from './handlers/presence-event.handler';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private socketAuth: SocketAuthService,
    private presence: PresenceService,
    // private roomAccess: RoomAccessService,
    private emitter: SocketEmitterService,
    private roomHandler: RoomEventHandler,
    private messageHandler: MessageEventHandler,
    private typingHandler: TypingEventHandler,
    private reactionHandler: ReactionEventHandler,
    private presenceHandler: PresenceEventHandler,
  ) { }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const { userId, email } =
        await this.socketAuth.authenticateSocket(client);
      this.socketAuth.attachUserToSocket(client, userId, email);
      this.presence.addUser(client.id, userId.toString());

      client.emit('connected', {
        message: 'Connected to chat server',
        userId,
      });

      this.emitter.emitAll(this.server, 'user-status', {
        userId,
        status: 'online',
        timestamp: new Date(),
      });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const presence = this.presence.removeUser(client.id);

    if (presence) {
      this.presenceHandler.handleUserDisconnect(
        this.server,
        presence.userId,
        presence.rooms,
      );
    }
  }

  // ========== ROOM EVENTS ==========
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    return this.roomHandler.handleJoinRoom(
      this.server,
      client,
      data,
      this.presence,
      // this.roomAccess,
    );
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    return this.roomHandler.handleLeaveRoom(client, data, this.presence);
  }

  @SubscribeMessage('get-room-users')
  async handleGetRoomUsers(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    return this.roomHandler.handleGetRoomUsers(this.server, client, data);
  }

  // ========== MESSAGE EVENTS ==========
  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; content: string; tempId?: string },
  ) {
    return this.messageHandler.handleSendMessage(this.server, client, data);
  }

  @SubscribeMessage('message-read')
  async handleMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; messageId: number },
  ) {
    return this.messageHandler.handleMessageRead(client, data);
  }

  @SubscribeMessage('mark-room-read')
  async handleMarkRoomRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    return this.messageHandler.handleMarkRoomRead(client, data);
  }

  // ========== TYPING EVENTS ==========
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    return this.typingHandler.handleTyping(client, data);
  }

  // ========== REACTION EVENTS ==========
  @SubscribeMessage('add-reaction')
  async handleAddReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { roomId: string; messageId: number; emoji: string },
  ) {
    return this.reactionHandler.handleAddReaction(client, data);
  }

  @SubscribeMessage('remove-reaction')
  async handleRemoveReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { roomId: string; messageId: number; emoji: string },
  ) {
    return this.reactionHandler.handleRemoveReaction(client, data);
  }

  // ========== PRESENCE EVENTS ==========
  @SubscribeMessage('check-user-status')
  handleCheckUserStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    return this.presenceHandler.handleCheckStatus(client, data, this.presence);
  }
}
