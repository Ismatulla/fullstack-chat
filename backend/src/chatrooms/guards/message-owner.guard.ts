import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MessagesService } from '../services/message.service';

@Injectable()
export class MessageOwnerGuard implements CanActivate {
  constructor(private messagesService: MessagesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const messageId = parseInt(request.params.id);

    const message = await this.messagesService.findById(messageId);

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }
    if (message.sender.id !== userId) {
      throw new ForbiddenException('You can only modify your own messages');
    }
    request.message = message;
    return true;
  }
}
