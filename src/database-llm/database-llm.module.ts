import { Module } from '@nestjs/common';
import { DatabaseLlmService } from './database-llm.service';
import { DatabaseLlmController } from './database-llm.controller';
import { Post } from './entities/post.entity';
import { User } from './entities/user.entity';
import { Like } from './entities/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Like])],
  controllers: [DatabaseLlmController],
  providers: [DatabaseLlmService],
})
export class DatabaseLlmModule {}
