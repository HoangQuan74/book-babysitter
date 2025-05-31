import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import { PostTypeEntity } from './post-type.entity';
import { PostCategoryEntity } from './post-category.entity';
import { UserEntity } from './user.entity';
import { CountryEntity } from './country.entity';
import { CityEntity } from './city.entity';
import { PostCommentEntity } from './post-comment.entity';
import { PostViewEntity } from './post-view.entity';
import { PostReactEntity } from './post-react.entity';

enum ETargetUserType {
  All = 'ALL',
  BABY_SITTER = 'babysitter',
  PARENT = 'parent',
}

@Entity('post')
export class PostEntity extends BaseEntity {
  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'type_id', nullable: true })
  typeId: string;

  @Column({ name: 'country_id', nullable: true })
  countryId: string;

  @Column({ name: 'city_id', nullable: true })
  cityId: string;

  @Column({ name: 'is_admin_post', type: 'bool', default: false })
  isAdminPost: boolean;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  files: Object[];

  @Column({ name: 'target_user_type', nullable: true })
  targetUserType: ETargetUserType;

  @Column({ name: 'is_visible', type: 'bool', default: true })
  isVisible: boolean;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ name: 'count_view', default: 0 })
  countView: number;

  @ManyToOne(() => PostTypeEntity, (type) => type.id)
  @JoinColumn({ name: 'type_id' })
  type: PostTypeEntity;

  @ManyToOne(() => PostCategoryEntity, (category) => category.id)
  @JoinColumn({ name: 'category_id' })
  category: PostCategoryEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @ManyToOne(() => CountryEntity, (country) => country.id)
  @JoinColumn({ name: 'country_id' })
  country: CountryEntity;

  @ManyToOne(() => CityEntity, (city) => city.id)
  @JoinColumn({ name: 'city_id' })
  city: CityEntity;

  @OneToMany(() => PostCommentEntity, (comment) => comment.post)
  comment: PostCommentEntity;

  @OneToMany(() => PostViewEntity, (view) => view.post)
  view: PostViewEntity;

  @OneToMany(() => PostReactEntity, (react) => react.post)
  react: PostReactEntity;
}
