import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  prompt: string;
}
