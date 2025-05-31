import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { UserEntity } from '.';

export enum ERankingType {
  RATING = 'rating',
  MONTHLY_INCOME = 'monthly_income',
  YEARLY_INCOME = 'yearly_income',
}

@Entity('babysitter_rankings')
export class BabysitterRankingEntity extends BaseEntity {
  @Index()
  @Column({ name: 'babysitter_id' })
  babysitterId: string;

  @Column({
    type: 'enum',
    enum: ERankingType,
    name: 'ranking_type',
  })
  rankingType: ERankingType;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'babysitter_id' })
  babysitter: UserEntity;
}
