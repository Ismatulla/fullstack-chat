import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatroomsService } from '../services/chatrooms.service';
import { MessagesService } from '../services/message.service';
import { CreateChatRoomDto } from '../dto/create-chatroom.dto';
import { CreateMessageDto } from '../dto/create-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatroomOwnerGuard } from '../guards/chatroom-owner.guard';
// import { ChatroomAccessGuard } from '../guards/chatroom-access.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentChatroom } from '../decorators/current-chatroom.decorator';
import { User } from '../../users/entities/user.entity';
import { Chatroom } from '../entities/chatroom.entity';
import { UpdateChatRoomDto } from '../dto/update-chatroom.dto';

@Controller('chatrooms')
@UseGuards(JwtAuthGuard)
export class ChatroomsController {
  constructor(
    private readonly chatroomsService: ChatroomsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Post()
  create(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @CurrentUser() user: User,
  ) {
    return this.chatroomsService.create(createChatRoomDto, user);
  }

  @Put(':id')
  @UseGuards(ChatroomOwnerGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChatRoomDto,
    @CurrentUser() user: User,
  ) {
    return this.chatroomsService.update(id, dto, user);
  }

  @Get()
  findAll() {
    return this.chatroomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chatroomsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(ChatroomOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentChatroom() chatroom: Chatroom) {
    return this.chatroomsService.delete(chatroom.id);
  }

  //Get messages for specific chatroom
  @Get(':id/messages')
  // @UseGuards(ChatroomAccessGuard)
  async getRoomMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('before') before?: string,
  ) {
    const beforeDate = before ? new Date(before) : undefined;
    return this.messagesService.getMessagesByRoom(id, limit || 50, beforeDate);
  }

  @Post(':id/messages')
  // @UseGuards(ChatroomAccessGuard)
  async createMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.create(createMessageDto.content, user.id, id);
  }

  // Search messages in chatroom
  @Get(':id/messages/search')
  // @UseGuards(ChatroomAccessGuard)
  async searchMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query('q') query: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.messagesService.searchMessages(id, query, limit || 20);
  }
}
