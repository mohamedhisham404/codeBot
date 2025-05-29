import { IsString, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsString({ each: true })
  codeFiles?: string[];

  @IsOptional()
  @IsString()
  prompt?: string;
}
