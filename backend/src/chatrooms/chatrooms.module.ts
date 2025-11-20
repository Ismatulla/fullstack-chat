// chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { Chatroom } from './entities/chatroom.entity';
import { Message } from './entities/message.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { MessageRead } from './entities/message-read.entity';
import { User } from '../users/entities/user.entity';

// Controllers
import { ChatroomsController } from './controllers/chatrooms.controller';
import { MessagesController } from './controllers/messages.controller';
import { UploadController } from './controllers/upload.controller';

// Services
import { ChatroomsService } from './services/chatrooms.service';
import { MessagesService } from './services/message.service';
import { UploadService } from './services/upload.service';
import { SocketAuthService } from './services/socket-auth.service';
import { PresenceService } from './services/presence.service';
import { RoomAccessService } from './services/room-access.service';
import { SocketEmitterService } from './services/socket-emitter.service';

// Gateway & Handlers
import { ChatGateway } from './chat.gateway';
import { RoomEventHandler } from './handlers/room-event.handler';
import { MessageEventHandler } from './handlers/message-event.handler';
import { TypingEventHandler } from './handlers/typing-event.handler';
import { ReactionEventHandler } from './handlers/reaction-event.handler';
import { PresenceEventHandler } from './handlers/presence-event.handler';

// Guards
import { ChatroomOwnerGuard } from './guards/chatroom-owner.guard';
import { ChatroomAccessGuard } from './guards/chatroom-access.guard';
import { MessageOwnerGuard } from './guards/message-owner.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chatroom,
      Message,
      MessageReaction,
      MessageRead,
      User,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [ChatroomsController, MessagesController, UploadController],
  providers: [
    // Core Services
    ChatroomsService,
    MessagesService,
    UploadService,

    // Socket Services
    SocketAuthService,
    PresenceService,
    RoomAccessService,
    SocketEmitterService,

    // Gateway
    ChatGateway,

    // Event Handlers
    RoomEventHandler,
    MessageEventHandler,
    TypingEventHandler,
    ReactionEventHandler,
    PresenceEventHandler,

    // Guards
    ChatroomOwnerGuard,
    ChatroomAccessGuard,
    MessageOwnerGuard,
  ],
  exports: [ChatroomsService, MessagesService, PresenceService],
})
export class ChatModule {}
