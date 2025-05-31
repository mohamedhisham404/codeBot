import { Body, Controller, Post, Res } from '@nestjs/common';
import { DatabasePindingService } from './database-pinding.service';
import { conditionalPindingDto } from './dto/create-conditionalPindin.dto';
import { Response } from 'express';
import { idPindingDto } from './dto/create_idPinding.dto';

@Controller('pindding')
export class DatabasePindingController {
  constructor(
    private readonly databasePindingService: DatabasePindingService,
  ) {}

  @Post('condition')
  async conditionalPinding(
    @Body() conditionalPindingDto: conditionalPindingDto,
    @Res() res: Response,
  ) {
    return this.databasePindingService.conditionalPinding(
      conditionalPindingDto,
      res,
    );
  }

  @Post('id')
  async idPinding(@Body() idPindingDto: idPindingDto, @Res() res: Response) {
    return this.databasePindingService.idPinding(idPindingDto, res);
  }

  @Post('entity')
  async entityPinding(
    @Body() idPindingDto: idPindingDto,
    @Res() res: Response,
  ) {
    return this.databasePindingService.entityPinding(idPindingDto, res);
  }
}
