import { Body, Controller, Post, Res, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Sse()
  sendEvent(@Body() createMessageDto: CreateMessageDto, @Res() res: Response) {
    return this.chatService.sendEvent(createMessageDto, res);
  }
}
