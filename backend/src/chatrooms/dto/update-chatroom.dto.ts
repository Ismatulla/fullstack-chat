import { IsOptional, MaxLength } from 'class-validator';

export class UpdateChatRoomDto {
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsOptional()
  image?: string;
}
