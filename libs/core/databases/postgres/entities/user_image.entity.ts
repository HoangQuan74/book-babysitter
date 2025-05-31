import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { UserEntity } from '.';

@Entity('user_images')
export class UserImageEntity extends BaseEntity {
  @Column()
  url: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  order: number;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
