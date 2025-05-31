import {
  Entity,
  ManyToOne,
  PrimaryColumn,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { userEntity } from './user.entity';
import { postEntity } from './post.entity';

@Entity('likes')
export class likeEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'post_id' })
  postId: number;

  @CreateDateColumn({ name: 'liked_at' })
  likedAt: Date;

  @ManyToOne(() => userEntity, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: userEntity;

  @ManyToOne(() => postEntity, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: postEntity;
}
