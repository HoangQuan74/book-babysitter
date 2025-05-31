import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { TermEntity } from './term.entity';
import { UserEntity } from './user.entity';

@Entity('user_term')
export class UserTermEntity extends BaseEntity {
  @Column({ name: 'is_agreed', type: 'bool' })
  isAgreed: boolean;

  @Index()
  @Column({ name: 'term_id' })
  termId: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => TermEntity, (term) => term.id)
  @JoinColumn({ name: 'term_id' })
  term: TermEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
