import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chatroom } from '../entities/chatroom.entity';
import { CreateChatRoomDto } from '../dto/create-chatroom.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ChatroomsService {
  constructor(
    @InjectRepository(Chatroom)
    private chatroomRepo: Repository<Chatroom>,
  ) {}

  async create(createChatRoomDto: CreateChatRoomDto, owner: User) {
    const normalizedName = createChatRoomDto.name.trim();

    const existingRoom = await this.chatroomRepo
      .createQueryBuilder('chatroom')
      .where('LOWER(chatroom.name) = LOWER(:name)', { name: normalizedName })
      .andWhere('chatroom.ownerId = :ownerId', { ownerId: owner.id })
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

  async findAll(userId: number) {
    return await this.chatroomRepo.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    });
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
