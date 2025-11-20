import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'Message content is required' })
  @MinLength(1)
  content: string;
}

