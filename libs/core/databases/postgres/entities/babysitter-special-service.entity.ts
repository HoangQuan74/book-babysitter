import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { LanguageEntity, SpecialServiceEntity, UserEntity } from '.';

@Entity('babysitter_special_service')
export class BabysitterSpecialServiceEntity extends BaseEntity {
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Index()
  @Column({ name: 'special_service_id' })
  specialServiceId: string;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => SpecialServiceEntity, (specialService) => specialService.id)
  @JoinColumn({ name: 'special_service_id' })
  specialService: SpecialServiceEntity;
}
