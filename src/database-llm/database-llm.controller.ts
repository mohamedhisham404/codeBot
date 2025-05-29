import { Body, Controller, Post, Res } from '@nestjs/common';
import { DatabaseLlmService } from './database-llm.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Response } from 'express';

@Controller('database-llm')
export class DatabaseLlmController {
  constructor(private readonly databaseLlmService: DatabaseLlmService) {}

  @Post()
  async sendEvent(
    @Body() createMessageDto: CreateMessageDto,
    @Res() res: Response,
  ) {
    return this.databaseLlmService.sendEvent(createMessageDto, res);
  }
}
