import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageReaction } from '../entities/message-reaction.entity';
import { MessageRead } from '../entities/message-read.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(MessageReaction)
    private reactionRepo: Repository<MessageReaction>,

    @InjectRepository(MessageRead)
    private readRepo: Repository<MessageRead>,
  ) { }

  async create(content: string, userId: number, roomId: number) {
    const message = this.messageRepo.create({
      content,
      sender: { id: userId },
      chatRoom: { id: roomId },
    });
    const saved = await this.messageRepo.save(message);
    return this.findById(saved.id);
  }

  async getMessagesByRoom(roomId: number, limit = 50, before?: Date) {
    const query = this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('reactions.user', 'reactionUser')
      .leftJoinAndSelect('message.readReceipts', 'readReceipts')
      .leftJoinAndSelect('readReceipts.user', 'readUser')
      .where('message.chatRoom = :roomId', { roomId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (before) {
      query.andWhere('message.createdAt < :before', { before });
    }
    const messages = await query.getMany();
    console.log(`Fetched ${messages.length} messages for room ${roomId}`);
    return messages.reverse();
  }

  // find message by ID

  async findById(messageId: number) {
    return await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender', 'reactions', 'readReceipts', 'readReceipts.user'],
    });
  }

  // Mark message as read
  async markAsRead(messageId: number, userId: number) {
    const existing = await this.readRepo.findOne({
      where: {
        message: { id: messageId },
        user: { id: userId },
      },
      relations: ['user'],
    });
    if (existing) {
      return existing;
    }
    const readReceipt = this.readRepo.create({
      message: { id: messageId },
      user: { id: userId },
      readAt: new Date(),
    });
    await this.readRepo.save(readReceipt);

    return await this.readRepo.findOne({
      where: { id: readReceipt.id },
      relations: ['user'],
    });
  }

  // Mark all messages in a room as read
  async markRoomAsRead(roomId: number, userId: number) {
    console.log(`[markRoomAsRead] Marking room ${roomId} as read for user ${userId}`);

    // Find all messages in the room that are NOT sent by the user
    // and do NOT have a read receipt from the user
    const unreadMessages = await this.messageRepo
      .createQueryBuilder('message')
      .leftJoin('message.sender', 'sender')
      .where('message.chatRoom = :roomId', { roomId })
      .andWhere('sender.id != :userId', { userId })
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('read.messageId')
          .from(MessageRead, 'read')
          .where('read.userId = :userId')
          .getQuery();
        return 'message.id NOT IN ' + subQuery;
      })
      .setParameter('userId', userId)
      .getMany();

    console.log(`[markRoomAsRead] Found ${unreadMessages.length} unread messages`);

    if (unreadMessages.length === 0) {
      return;
    }

    const readReceipts = unreadMessages.map((msg) =>
      this.readRepo.create({
        message: { id: msg.id },
        user: { id: userId },
        readAt: new Date(),
      }),
    );

    const savedReceipts = await this.readRepo.save(readReceipts);
    console.log(`[markRoomAsRead] Saved ${savedReceipts.length} read receipts`);

    // Return receipts with user relation for notification
    return await this.readRepo.find({
      where: {
        id: In(savedReceipts.map(r => r.id))
      },
      relations: ['user', 'message']
    });
  }

  // Edit a message
  async editMessage(messageId: number, userId: number, content: string): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender']
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.id !== userId) {
      throw new Error('Unauthorized to edit this message');
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    return await this.messageRepo.save(message);
  }

  // Delete a message
  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['sender']
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.id !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await this.messageRepo.remove(message);
  }

  // Clear all messages in a room (Owner only)
  async clearRoomMessages(roomId: number, userId: number): Promise<void> {
    console.log(`[clearRoomMessages] Attempting to clear room ${roomId} for user ${userId}`);

    // First, verify the room exists and user is the owner
    const room = await this.messageRepo.manager
      .createQueryBuilder()
      .select('chatroom')
      .from('chatrooms', 'chatroom')
      .where('chatroom.id = :roomId', { roomId })
      .andWhere('chatroom.ownerId = :userId', { userId })
      .getRawOne();

    if (!room) {
      console.error(`[clearRoomMessages] Room not found or user is not owner`);
      throw new Error('Room not found or you are not the owner');
    }

    // Delete all messages in the room
    const result = await this.messageRepo
      .createQueryBuilder()
      .delete()
      .from(Message)
      .where('chatRoomId = :roomId', { roomId })
      .execute();

    console.log(`[clearRoomMessages] Deleted ${result.affected} messages from room ${roomId}`);
  }

  // Get read receipts for a message

  async getReadReceipts(messageId: number) {
    return await this.readRepo.find({
      where: { message: { id: messageId } },
      relations: ['user'],
      order: { readAt: 'DESC' },
    });
  }

  //Add reaction to message
  async addReaction(messageId: number, userId: number, emoji: string) {
    // First, check if user already has a reaction on this message
    const existingReaction = await this.reactionRepo.findOne({
      where: { message: { id: messageId }, user: { id: userId } },
    });

    // If user already reacted with a different emoji, remove it first
    if (existingReaction && existingReaction.emoji !== emoji) {
      await this.reactionRepo.remove(existingReaction);
    }

    // If user already reacted with this exact emoji, just return it (idempotent)
    if (existingReaction && existingReaction.emoji === emoji) {
      return existingReaction;
    }

    // Add the new reaction
    const reaction = this.reactionRepo.create({
      message: { id: messageId },
      user: { id: userId },
      emoji,
    });
    return await this.reactionRepo.save(reaction);
  }

  // remove reaction from message
  async removeReaction(messageId: number, userId: number, emoji: string) {
    const reaction = await this.reactionRepo.findOne({
      where: { message: { id: messageId }, user: { id: userId }, emoji },
    });
    if (reaction) {
      await this.reactionRepo.remove(reaction);
    }
    return { deleted: true };
  }

  // Get all reactions for a message
  async getReactionsByMessage(messageId: number) {
    return await this.reactionRepo.find({
      where: { message: { id: messageId } },
      relations: ['user'],
    });
  }

  // Search messages in a room
  async searchMessages(roomId: number, query: string, limit = 20) {
    return await this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.chatRoom = :roomId', { roomId })
      .andWhere('message.content ILIKE :query', { query: `%${query}%` })
      .orderBy('message.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}

