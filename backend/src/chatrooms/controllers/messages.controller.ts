import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from '../services/message.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MessageOwnerGuard } from '../guards/message-owner.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':id')
  async getMessage(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.findById(id);
  }

  @Put(':id')
  @UseGuards(MessageOwnerGuard)
  async editedMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.editMessage(id, user.id, content);
  }

  @Delete(':id')
  @UseGuards(MessageOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.deleteMessage(id, user.id);
  }

  @Get(':id/read-receipts')
  async getReadReceipts(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.getReadReceipts(id);
  }

  @Get(':id/reactions')
  async getReactions(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.getReactionsByMessage(id);
  }
}
