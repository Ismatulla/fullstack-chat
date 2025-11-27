import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chatroom } from '../entities/chatroom.entity';
import { CreateChatRoomDto } from '../dto/create-chatroom.dto';
import { UpdateChatRoomDto } from '../dto/update-chatroom.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ChatroomsService {
  constructor(
    @InjectRepository(Chatroom)
    private chatroomRepo: Repository<Chatroom>,
  ) { }

  async create(createChatRoomDto: CreateChatRoomDto, owner: User) {
    const normalizedName = createChatRoomDto.name.trim();

    const existingRoom = await this.chatroomRepo
      .createQueryBuilder('chatroom')
      .where('LOWER(chatroom.name) = LOWER(:name)', { name: normalizedName })
      .getOne();

    if (existingRoom) {
      throw new ConflictException(
        `You already have a chatroom named "${normalizedName}"`,
      );
    }

    const chatroom = this.chatroomRepo.create({
      name: normalizedName,
      image: createChatRoomDto.image,
      owner,
    });

    return await this.chatroomRepo.save(chatroom);
  }
  async update(roomId: number, dto: UpdateChatRoomDto, owner: User) {
    const room = await this.chatroomRepo.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });

    if (!room) {
      throw new NotFoundException('Chatroom not found or not yours');
    }

    if (room.owner.id !== owner.id) {
      throw new ForbiddenException('You can only edit your own chatrooms');
    }

    // Update name if provided
    if (dto.name) {
      const normalizedName = dto.name.trim();

      const existingRoom = await this.chatroomRepo
        .createQueryBuilder('chatroom')
        .where('LOWER(chatroom.name) = LOWER(:name)', { name: normalizedName })
        .andWhere('chatroom.ownerId = :ownerId', { ownerId: owner.id })
        .andWhere('chatroom.id != :roomId', { roomId })
        .getOne();

      if (existingRoom) {
        throw new ConflictException(
          `You already have a chatroom named "${normalizedName}"`,
        );
      }

      room.name = normalizedName;
    }

    // Update image independently
    if (dto.image !== undefined) {
      room.image = dto.image;
    }

    return await this.chatroomRepo.save(room);
  }

  async findAll(userId: number) {
    return await this.chatroomRepo
      .createQueryBuilder('chatroom')
      .leftJoinAndSelect('chatroom.owner', 'owner')
      .loadRelationCountAndMap('chatroom.unreadCount', 'chatroom.messages', 'message', (qb) =>
        qb.where(
          'message.senderId != :userId AND message.id NOT IN (SELECT "messageId" FROM "message_reads" WHERE "userId" = :userId)',
          { userId },
        ),
      )
      .orderBy('chatroom.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    const chatroom = await this.chatroomRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!chatroom) {
      throw new NotFoundException(`Chatroom with ID ${id} not found`);
    }
    return chatroom;
  }

  async delete(id: number) {
    const chatroom = await this.findOne(id);
    await this.chatroomRepo.remove(chatroom);
    return { message: 'chatroom deleted successfully' };
  }

  // used by guards and gateway for authorization
  async verifyUserAccess(roomId: number, userId: number): Promise<boolean> {
    const chatroom = await this.chatroomRepo.findOne({
      where: { id: roomId, owner: { id: userId } },
    });
    return !!chatroom;
  }
}
