import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { postEntity } from './post.entity';
import { likeEntity } from './like.entity';

@Entity('users')
export class userEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 100, unique: true, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => postEntity, (post) => post.user)
  posts: postEntity[];

  @OneToMany(() => likeEntity, (like) => like.user)
  likes: likeEntity[];
}
