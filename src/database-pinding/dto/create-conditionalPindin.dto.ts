import { IsString } from 'class-validator';

export class conditionalPindingDto {
  @IsString()
  phrase: string;

  @IsString()
  condition: string;
}
