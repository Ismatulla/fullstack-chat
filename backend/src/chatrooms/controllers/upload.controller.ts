// controllers/upload.controller.ts
import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatroomAccessGuard } from '../guards/chatroom-access.guard';
import { UploadService } from '../services/upload.service';

@Controller('chatrooms/:id/upload')
@UseGuards(JwtAuthGuard, ChatroomAccessGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFile(
    @Param('id', ParseIntPipe) roomId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadFile(file, roomId);

    return {
      success: true,
      file: result,
    };
  }
}
