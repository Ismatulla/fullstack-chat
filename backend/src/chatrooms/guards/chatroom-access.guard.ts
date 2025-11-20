import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ChatroomsService } from '../services/chatrooms.service';

@Injectable()
export class ChatroomAccessGuard implements CanActivate {
  constructor(private chatroomsService: ChatroomsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const roomId = parseInt(request.params.id || request.params.roomId);

    const hasAccess = await this.chatroomsService.verifyUserAccess(
      roomId,
      userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You dont have an access to this chatroom');
    }
    return true;
  }
}
