import { IsString } from 'class-validator';

export class idPindingDto {
  @IsString()
  phrase: string;
}
