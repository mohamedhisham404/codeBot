import { Module } from '@nestjs/common';
import { DatabasePindingService } from './database-pinding.service';
import { DatabasePindingController } from './database-pinding.controller';
import { Post } from './entities/post.entity';
import { User } from './entities/user.entity';
import { Like } from './entities/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Like])],
  controllers: [DatabasePindingController],
  providers: [DatabasePindingService],
})
export class DatabasePindingModule {}
