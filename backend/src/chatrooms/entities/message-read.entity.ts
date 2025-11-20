import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';

@Entity('message_reads')
@Index(['message', 'user'], { unique: true })
export class MessageRead {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, (message) => message.readReceipts, {
    onDelete: 'CASCADE',
  })
  message: Message;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  user: User;

  @CreateDateColumn()
  readAt: Date;
}
