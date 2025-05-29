import { Body, Controller, Post, Res } from '@nestjs/common';
import { CodeService } from './code.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Response } from 'express';

@Controller('chat')
export class CodeController {
  constructor(private readonly chatService: CodeService) {}

  @Post()
  async sendEvent(
    @Body() createMessageDto: CreateMessageDto,
    @Res() res: Response,
  ) {
    return this.chatService.sendEvent(createMessageDto, res);
  }
}
