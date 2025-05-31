import { Module } from '@nestjs/common';
import { DatabasePindingService } from './database-pinding.service';
import { DatabasePindingController } from './database-pinding.controller';
import { postEntity } from './entities/post.entity';
import { userEntity } from './entities/user.entity';
import { likeEntity } from './entities/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([postEntity, userEntity, likeEntity])],
  controllers: [DatabasePindingController],
  providers: [DatabasePindingService],
})
export class DatabasePindingModule {}
