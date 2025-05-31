import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { UserEntity } from './user.entity';
// import { ELanguageLevel } from '@lib/common/enums';
import { LanguageEntity } from './language.entity';
enum ELanguageLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('user_language')
export class UserLanguageEntity extends BaseEntity {
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Index()
  @Column({ name: 'language_id' })
  languageId: string;

  @Column({ type: 'enum', enum: ELanguageLevel })
  level: ELanguageLevel;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => LanguageEntity, (language) => language.id)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;
}
