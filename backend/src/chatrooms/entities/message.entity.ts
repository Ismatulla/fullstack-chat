import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Chatroom } from './chatroom.entity';
import { MessageReaction } from './message-reaction.entity';
import { MessageRead } from './message-read.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => Chatroom, { onDelete: 'CASCADE' })
  chatRoom: Chatroom;

  @OneToMany(() => MessageReaction, (reaction) => reaction.message, {
    cascade: true,
  })
  reactions: MessageReaction[];

  @OneToMany(() => MessageRead, (read) => read.message, {
    cascade: true,
  })
  readReceipts: MessageRead[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  editedAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
