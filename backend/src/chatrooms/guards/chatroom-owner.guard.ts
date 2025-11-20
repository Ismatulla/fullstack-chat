import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { ChatroomsService } from '../services/chatrooms.service';

@Injectable()
export class ChatroomOwnerGuard implements CanActivate {
  constructor(private chatroomsService: ChatroomsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const roomId = parseInt(request.params.id);

    const chatroom = await this.chatroomsService.findOne(roomId);

    if (!chatroom) {
      throw new NotFoundException(`Chatroom with ID: ${roomId} not found`);
    }

    if (chatroom.owner.id !== userId) {
      throw new ForbiddenException('You are not owner of this chatroom');
    }
    // attach chatroom to request for reuse in controller
    request.chatroom = chatroom;
    return true;
  }
}
