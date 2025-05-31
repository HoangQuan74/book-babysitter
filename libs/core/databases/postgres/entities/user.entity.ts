import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base-entity';
// import { hashPassword } from '@lib/utils';
// import { ECurrency, EnumGender, EUserRole } from '@lib/common/enums';
import { UserLanguageEntity } from './user-language.entity';
import { UserTermEntity } from './user-term.entity';
import { LanguageEntity } from './language.entity';

import { compareSync, hashSync, genSaltSync } from 'bcrypt';
import { UserImageEntity } from './user_image.entity';
import {
  BabysitterRankingEntity,
  BabysitterSpecialServiceEntity,
  BookingEntity,
  CityEntity,
  CurrencyEntity,
  FavoriteBabysitterEntity,
  PointEntity,
  PostCommentEntity,
  PostEntity,
  RatingUserEntity,
  ReviewBabysitterEntity,
  SocialAccountEntity,
  UserDeviceEntity,
  UserPermissionEntity,
  UserRoleEntity,
} from '.';
import { UserDeviceDto } from 'apps/user-gateway/src/user/dto';
const saltRounds = genSaltSync(parseInt(process.env.SALT_ROUNDS));
const hashPassword = (password: string): string => {
  return hashSync(password, saltRounds);
};

enum EnumGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

enum ECurrency {
  VND = 'vnd',
  USD = 'usd',
  KW = 'kw',
}

export enum EUserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  BABY_SITTER = 'babysitter',
  PARENT = 'parent',
}

enum ENumberOfExperience {
  UNDER_3_YEARS = 'under 3 years',
  OVER_3_YEARS = 'over 3 years',
  OVER_5_YEARS = 'over 5 years',
  OVER_7_YEARS = 'over 7 years',
}

enum ENumberOfChild {
  NO_CHILD = 'no child',
  ONE_CHILD = 'one child',
  TWO_OR_MORE_CHILDREN = 'two or more children',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  experience: number;

  @Column({ type: 'enum', enum: EUserRole })
  role: EUserRole;

  @Column({
    type: 'decimal',
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  salary: number;

  @Index()
  @Column({ name: 'currency_id', nullable: true })
  currencyId: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob: string;

  @Column({ name: 'gender', type: 'enum', enum: EnumGender, nullable: true })
  gender: EnumGender;

  @Column({ nullable: true })
  phone: string;

  @Index()
  @Column({ name: 'city_id', nullable: true })
  cityId: string;

  @Column({ name: 'country_id', nullable: true })
  countryId: string;

  @Column({
    name: 'num_child',
    type: 'enum',
    enum: ENumberOfChild,
    nullable: true,
  })
  numChild: ENumberOfChild;

  @Column({
    name: 'num_experience',
    type: 'enum',
    enum: ENumberOfExperience,
    nullable: true,
  })
  numExperience: ENumberOfExperience;

  @Column({ name: 'estimate_income', nullable: true })
  estimateIncome: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  introduce: string;

  @Column({ name: 'sub_introduce', type: 'text', nullable: true })
  subIntroduce: string;

  @Column({ nullable: true })
  images: string;

  @Column({ name: 'completed_signup', type: 'timestamp', nullable: true })
  completedSignup: Date;

  @Index()
  @Column({ name: 'setting_language_id' })
  settingLanguageId: string;

  @Column({ name: 'user_code', unique: true })
  userCode: string;

  @Column({ name: 'allow_booking', default: false })
  allowBooking: boolean;

  @Column({ name: 'avg_rating', nullable: true, type: 'float' })
  avgRating: number;

  @Column({ name: 'is_marketing_account', default: false })
  isMarketingAccount: boolean;

  @OneToMany(() => UserLanguageEntity, (userLanguage) => userLanguage.user, {
    cascade: true,
  })
  userLanguages: UserLanguageEntity[];

  @OneToMany(() => UserTermEntity, (userTerm) => userTerm.user, {
    cascade: true,
  })
  userTerms: UserTermEntity[];

  @ManyToOne(() => LanguageEntity, (language) => language.id)
  @JoinColumn({ name: 'setting_language_id' })
  language: LanguageEntity;

  @ManyToOne(() => CityEntity, (city) => city.id)
  @JoinColumn({ name: 'city_id' })
  city: CityEntity;

  @OneToMany(() => UserImageEntity, (userImage) => userImage.user, {
    cascade: true,
  })
  userImages: UserImageEntity[];

  @OneToMany(
    () => BabysitterSpecialServiceEntity,
    (userImage) => userImage.user,
    {
      cascade: true,
    },
  )
  babysitterSpecialServices: BabysitterSpecialServiceEntity[];

  @ManyToOne(() => CurrencyEntity, (currency) => currency.id)
  @JoinColumn({ name: 'currency_id' })
  currency: CurrencyEntity;

  @OneToMany(() => SocialAccountEntity, (socialAccount) => socialAccount.user, {
    cascade: true,
  })
  socialAccount: SocialAccountEntity;

  @OneToMany(
    () => ReviewBabysitterEntity,
    (ReviewBabysitter) => ReviewBabysitter.babysitter,
    {
      cascade: true,
    },
  )
  reviewBabysitter: ReviewBabysitterEntity[];

  @OneToMany(() => RatingUserEntity, (ratingUser) => ratingUser.babysitter)
  ratingUser: RatingUserEntity[];

  @OneToOne(() => UserRoleEntity, (userRole) => userRole.user, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  userRole: UserRoleEntity;

  @OneToMany(
    () => UserPermissionEntity,
    (userPermission) => userPermission.user,
    { cascade: true },
  )
  userPermissions: UserPermissionEntity[];

  @OneToOne(() => PointEntity, (point) => point.babySitter, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  point: PointEntity;

  @OneToMany(() => UserDeviceEntity, (device) => device.user, { cascade: true })
  devices: UserDeviceEntity[];

  @OneToMany(() => BookingEntity, (booking) => booking.babysitter, {
    cascade: true,
  })
  bookings: BookingEntity[];

  @OneToMany(() => BookingEntity, (booking) => booking.parent)
  bookingParents: BookingEntity[];

  @OneToMany(() => PostEntity, (post) => post.owner, { cascade: true })
  userPosts: PostEntity[];

  @OneToMany(() => PostCommentEntity, (post) => post.user, { cascade: true })
  userPostComments: PostCommentEntity[];

  @OneToMany(
    () => FavoriteBabysitterEntity,
    (favorite) => favorite.babysitter,
    { cascade: true },
  )
  favoriteBabysitters: FavoriteBabysitterEntity[];

  @OneToMany(() => BabysitterRankingEntity, (ranking) => ranking.babysitter, {
    cascade: true,
  })
  babysitterRankings: BabysitterRankingEntity[];

  countOnePoint: number;
  countTwoPoint: number;
  countThreePoint: number;
  countFourPoint: number;
  countFivePoint: number;
  countTotalRating: number;
  resources: any;

  revenue: number;
  countConfirmedBookingCancellations: number;
  countBooking: number;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (this.password) {
      this.password = hashPassword(this.password);
    }
  }
}
