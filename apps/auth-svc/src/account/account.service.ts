import {
  errorMessage,
  MAX_ADMIN_USER_PROFILE_BOOKING,
  MAX_ADMIN_USER_PROFILE_POST,
  MINIMUM_REVIEW_COUNT,
} from '@lib/common/constants';
import {
  DbName,
  EBabysitterType,
  EBookingStatus,
  EFilterAge,
  ELanguage,
  ENumberOfExperience,
  ENumOfChildrenCared,
  EService,
  ESortBabysitter,
  ETypeSearchUser,
  EUserRole,
} from '@lib/common/enums';
import {
  IBabysitterSpecialService,
  IBookingAdmin,
  ICreateBabysitter,
  IManager,
  IQuery,
  IQueryBabysitter,
  IQueryManager,
  IQueryUser,
  IRequestUser,
  IUpdateBabysitterSpecialService,
  IUpdateUser,
  IUpdateUserImage,
  IUpdateUserLanguages,
  IUserImage,
  IUserLanguage,
  UpdateBabysitterAllowBookingStatus,
} from '@lib/common/interfaces';
import {
  BabysitterSpecialServiceEntity,
  BookingEntity,
  CityEntity,
  FavoriteBabysitterEntity,
  LanguageEntity,
  PostEntity,
  RatingCommentImageEntity,
  RatingUserEntity,
  ReviewBabysitterEntity,
  RoleEntity,
  UserEntity,
  UserImageEntity,
  UserLanguageEntity,
  UserPermissionEntity,
  UserTermEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import {
  formatKey,
  formatUser,
  generatePassword,
  generateUserCode,
  getDateOfBirthByAge,
  roundRating,
} from '@lib/utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  In,
  IsNull,
  Not,
  SelectQueryBuilder,
} from 'typeorm';
import { MessageBuilder } from '@lib/core/message-builder';
import { ResourceService } from '../resource/resource.service';
import { isEmpty } from 'lodash';

@Injectable()
export class AccountService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    private readonly awsClientService: AwsClientService,
    private readonly messageBuilder: MessageBuilder,
    private readonly resourceService: ResourceService,
  ) {
    super();
  }

  async getProfile(reqUser: IRequestUser, langCode: ELanguage) {
    const { userId } = reqUser;
    const profile = await this.getOne(this.postgresData, UserEntity, {
      where: { id: userId },
      relations: ['userRole'],
    });

    if (profile.role === EUserRole.MANAGER) {
      profile.resources = await this.resourceService.getResources(
        langCode,
        profile.id,
      );
    }

    return formatUser(profile, langCode);
  }

  async getUserDeleted(query: any) {
    const { limit, page, role, deletedFrom, deletedTo } = query;
    const queryBuilder = this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .withDeleted()
      .leftJoinAndMapOne(
        'user.avatar',
        'user.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .leftJoin('user.city', 'city')
      .where('user.deletedAt IS NOT NULL')
      .andWhere('user.isActive = true')
      .select([
        'user.id',
        'user.userCode',
        'user.email',
        'user.phone',
        'user.username',
        'user.dob',
        'user.deletedAt',
        'city.name',
        'avatar.url',
      ]);

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    } else {
      queryBuilder.andWhere('user.role IN (:...role)', {
        role: [EUserRole.BABY_SITTER, EUserRole.PARENT],
      });
    }

    if (deletedFrom) {
      queryBuilder.andWhere('user.deletedAt >= :deletedFrom', { deletedFrom });
    }

    if (deletedTo) {
      queryBuilder.andWhere('user.deletedAt <= :deletedTo', { deletedTo });
    }

    const [results, total] = await queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    return { results, total };
  }

  async getUserByUserCode(query: any) {
    try {
      const user = await this.getOne(this.postgresData, UserEntity, {
        where: {
          userCode: query.userCode,
          role: query.role,
        },
        select: {
          id: true,
          userCode: true,
          email: true,
          phone: true,
          allowBooking: true,
        },
      });

      if (!user) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      if (query.role === EUserRole.BABY_SITTER && !user.allowBooking) {
        throw new BadRequestException(
          errorMessage.BABY_SITTER_NOT_ALLOW_BOOKING,
        );
      }

      return user;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getLanguageByLanguageCode(code: string) {
    const language = await this.getOne(this.postgresData, LanguageEntity, {
      where: { languageCode: code },
      select: { id: true },
    });

    if (!language) {
      throw new BadRequestException(errorMessage.BAD_REQUEST);
    }
    return language;
  }

  async getProfileUser(
    lang: ELanguage,
    reqUser: IRequestUser,
    search?: IQueryUser,
  ) {
    try {
      const userRepo = this.getRepository(this.postgresData, UserEntity);
      const query = userRepo.createQueryBuilder('user').withDeleted();

      this.addUserSearchCondition(query, search, reqUser);

      this.addRelationsAndSelections(query);

      const user = await query.orderBy('userImage.order', 'ASC').getOne();
      if (!user) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      user.userPosts = await this.getUserPosts(user.id);

      if (user.role === EUserRole.BABY_SITTER) {
        await this.enrichBabySitterProfile(user, lang);
      }

      if (this.shouldGetBabysitterReviews(reqUser, user)) {
        user.reviewBabysitter = await this.getReviewAboutBabysitter(
          user.id,
          lang,
        );
      }

      if (this.isAdminOrManager(reqUser.role)) {
        await this.enrichAdminProfile(user);
      }

      return { user: formatUser(user, lang) };
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getReviewOfBabysitters(reqUser: IRequestUser, query: IQuery) {
    const [results, total] = await this.getRepository(
      this.postgresData,
      RatingUserEntity,
    )
      .createQueryBuilder('ratingUser')
      .leftJoin('ratingUser.comment', 'comment')
      .leftJoin('comment.images', 'image')
      .where('ratingUser.parentId = :userId', { userId: reqUser.userId })
      .leftJoin('ratingUser.babysitter', 'babysitter')
      .leftJoinAndMapOne(
        'babysitter.avatar',
        'babysitter.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .select([
        'ratingUser.id',
        'ratingUser.point',
        'ratingUser.createdAt',
        'babysitter.id',
        'babysitter.username',
        'avatar.url',
        'comment.content',
        'image.url',
      ])
      .getManyAndCount();
    return { results, total };
  }

  private addUserSearchCondition(
    query: SelectQueryBuilder<UserEntity>,
    search: IQueryUser | undefined,
    reqUser: IRequestUser,
  ): void {
    if (!search) {
      query.where('user.id = :id', { id: reqUser.userId });
      return;
    }

    switch (search.type) {
      case ETypeSearchUser.EMAIL:
        query.where('user.email = :email', { email: search.identifier });
        break;
      case ETypeSearchUser.USER_CODE:
        query.where('user.userCode = :userCode', {
          userCode: search.identifier,
        });
        break;
      default:
        query.where('user.id = :id', { id: search.identifier });
        break;
    }

    query.andWhere('user.role IN (:...roles)', {
      roles: [EUserRole.BABY_SITTER, EUserRole.PARENT],
    });
  }

  private addRelationsAndSelections(
    query: SelectQueryBuilder<UserEntity>,
  ): void {
    query
      .leftJoinAndMapOne(
        'user.socialAccount',
        'user.socialAccount',
        'socialAccount',
      )
      .leftJoin('user.userLanguages', 'userLanguage')
      .leftJoin('userLanguage.language', 'language')
      .leftJoin('user.userImages', 'userImage')
      .leftJoin('user.point', 'point')
      .leftJoin('user.currency', 'currency')
      .leftJoin('user.city', 'city');

    for (let point = 1; point <= 5; point++) {
      this.addRatingCount(query, point);
    }

    query.addSelect([
      'userLanguage.id',
      'userLanguage.level',
      'userLanguage.languageId',
      'language.id',
      'language.languageCode',
      'userImage.id',
      'userImage.url',
      'userImage.order',
      'point.totalPoint',
      'currency.unit',
      'city.name',
      'user.deletedAt',
    ]);
  }

  private addRatingCount(
    query: SelectQueryBuilder<UserEntity>,
    point: number,
  ): void {
    query.loadRelationCountAndMap(
      `user.count${this.getPointWord(point)}Point`,
      'user.ratingUser',
      'rating',
      (qb) => qb.where('rating.point = :point', { point }),
    );
  }

  private getPointWord(point: number): string {
    const words = ['One', 'Two', 'Three', 'Four', 'Five'];
    return words[point - 1];
  }

  private async enrichBabySitterProfile(
    user: UserEntity,
    lang: ELanguage,
  ): Promise<void> {
    this.calculateRating(user);

    [user.city, user.ratingUser, user.babysitterSpecialServices] =
      await Promise.all([
        this.getCityById(user.cityId, lang),
        this.getRatingUser(user.id),
        this.getBabysitterSpecialService(user.id, lang),
      ]);
  }

  private isAdminOrManager(role: EUserRole): boolean {
    return role === EUserRole.ADMIN || role === EUserRole.MANAGER;
  }

  private shouldGetBabysitterReviews(
    reqUser: IRequestUser,
    user: UserEntity,
  ): boolean {
    return (
      ![EUserRole.ADMIN, EUserRole.MANAGER].includes(reqUser.role) &&
      user.role === EUserRole.BABY_SITTER
    );
  }

  private async enrichAdminProfile(user: UserEntity): Promise<void> {
    [user.userTerms, user.bookings] = await Promise.all([
      this.getUserTerms(user.id),
      this.getUserBookings(user),
    ]);
  }

  private async getUserTerms(userId: string) {
    return this.getRepository(this.postgresData, UserTermEntity)
      .createQueryBuilder('userTerm')
      .leftJoin('userTerm.term', 'term')
      .where('userTerm.userId = :userId', { userId })
      .select([
        'userTerm.isAgreed',
        'term.id',
        'term.title',
        'term.content',
        'term.order',
      ])
      .orderBy('term.order', 'ASC')
      .getMany();
  }

  private async getUserPosts(userId: string) {
    return this.getRepository(this.postgresData, PostEntity)
      .createQueryBuilder('post')
      .leftJoin('post.city', 'city')
      .leftJoin('post.type', 'type')
      .leftJoin('post.owner', 'owner')
      .leftJoin('post.category', 'category')
      .where('post.ownerId = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.files',
        'post.createdAt',
        'city.id',
        'city.name',
        'type.id',
        'type.name',
      ])
      .addSelect(['category.id', 'category.name'])
      .addSelect(['owner.id', 'owner.username'])
      .limit(MAX_ADMIN_USER_PROFILE_POST)
      .getMany();
  }

  async getUserBookings(user: UserEntity) {
    const queryBuilder = this.getRepository(this.postgresData, BookingEntity)
      .createQueryBuilder('booking')
      .leftJoin('booking.city', 'city')
      .leftJoin('booking.bookingTimes', 'bookingTime')
      .leftJoin('booking.bookingChildren', 'bookingChildren')
      .leftJoin('booking.currency', 'currency')
      .where('booking.status != :status', { status: EBookingStatus.DRAFT })
      .select([
        'booking.id',
        'booking.bookCode',
        'booking.address',
        'booking.prices',
        'booking.confirmedAt',
        'booking.paymentMethod',
        'bookingTime.id',
        'bookingTime.startTime',
        'bookingTime.endTime',
        'bookingTime.hasBreakTime',
        'city.id',
        'city.name',
        'currency.id',
        'currency.unit',
        'bookingChildren.id',
        'bookingChildren.gender',
        'bookingChildren.dob',
      ]);

    if (user.role === EUserRole.BABY_SITTER) {
      queryBuilder.andWhere('booking.babysitterId = :userId', {
        userId: user.id,
      });
    } else {
      queryBuilder.andWhere('booking.parentId = :userId', {
        userId: user.id,
      });
    }

    return queryBuilder
      .orderBy('booking.createdAt', 'DESC')
      .limit(MAX_ADMIN_USER_PROFILE_BOOKING)
      .getMany();
  }

  private async getCityById(id: string, lang: ELanguage) {
    return await this.getRepository(this.postgresData, CityEntity)
      .createQueryBuilder('city')
      .select(['city.id as id', 'city.name::jsonb->>:lang as name'])
      .setParameter('lang', lang)
      .where('city.id = :id', { id })
      .getRawOne();
  }

  private async getRatingUser(userId: string) {
    const query = this.getRepository(this.postgresData, RatingUserEntity)
      .createQueryBuilder('rating')
      .leftJoin('rating.parent', 'parent')
      .leftJoinAndMapOne(
        'parent.avatarCommenter',
        'parent.userImages',
        'avatarCommenter',
        'avatarCommenter.order = 0',
      )
      .leftJoin('rating.comment', 'comment', 'comment.parentId is null')
      .leftJoin('comment.images', 'images')
      .leftJoin('comment.children', 'children')
      .leftJoin('children.user', 'userReply')
      .leftJoinAndMapOne(
        'userReply.avatarUser',
        'userReply.userImages',
        'avatarUser',
        'avatarUser.order = 0',
      )
      .where('rating.babysitterId = :userId', { userId })
      .andWhere('comment.id IS NOT NULL')
      .select([
        'rating.id',
        'rating.point',
        'parent.username',
        'parent.id',
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'children.id',
        'children.content',
        'children.createdAt',
        'userReply.id',
        'userReply.username',
        'images.url',
        'avatarCommenter.url',
        'avatarUser.url',
      ]);
    return await query.getMany();
  }

  private async getBabysitterSpecialService(userId: string, langCode: string) {
    const query = this.getRepository(
      this.postgresData,
      BabysitterSpecialServiceEntity,
    )
      .createQueryBuilder('babysitterSpecialService')
      .leftJoin('babysitterSpecialService.specialService', 'specialService')
      .where('babysitterSpecialService.userId = :userId', { userId })
      .andWhere('specialService.id IS NOT NULL')
      .select([
        'babysitterSpecialService.id as id',
        `specialService.content ::jsonb->>'${langCode}' as content`,
      ])
      .addSelect('specialService.id', 'specialServiceId')
      .addSelect(
        `specialService.shortContent ::jsonb->>'${langCode}'`,
        'shortContent',
      );
    return await query.getRawMany();
  }

  private calculateRating(user: UserEntity) {
    const {
      countOnePoint,
      countTwoPoint,
      countThreePoint,
      countFourPoint,
      countFivePoint,
    } = user;
    const totalRating =
      countOnePoint +
      countTwoPoint * 2 +
      countThreePoint * 3 +
      countFourPoint * 4 +
      countFivePoint * 5;
    user.countTotalRating =
      countOnePoint +
      countTwoPoint +
      countThreePoint +
      countFourPoint +
      countFivePoint;
    const rawAverage = totalRating / user.countTotalRating;
    user.avgRating = roundRating(rawAverage);
  }

  async getReviewAboutBabysitter(id: string, lang: string) {
    const query = this.getRepository(this.postgresData, ReviewBabysitterEntity)
      .createQueryBuilder('reviewBabysitter')
      .select('review.id', 'reviewId')
      .addSelect('review.content ::jsonb->>:lang as content')
      .setParameter('lang', lang)
      .leftJoin('reviewBabysitter.review', 'review')
      .where('reviewBabysitter.babysitterId = :id', { id })
      .groupBy('review.id')
      .having('COUNT(review.id) >= :min', { min: MINIMUM_REVIEW_COUNT });

    return query.getRawMany();
  }

  async updateProfile(reqUser: IRequestUser, data: IUpdateUser) {
    try {
      const {
        userImages,
        userLanguages,
        babysitterSpecialServices,
        ...updatedUser
      } = data;
      const userRepo = this.getRepository(this.postgresData, UserEntity);
      const userId = [EUserRole.ADMIN, EUserRole.MANAGER].includes(reqUser.role)
        ? data.id
        : reqUser.userId;

      let query = userRepo
        .createQueryBuilder('user')
        .withDeleted()
        .where('user.id = :id', { id: userId });

      if (userLanguages) {
        query = query
          .leftJoin('user.userLanguages', 'userLanguage')
          .addSelect([
            'userLanguage.id',
            'userLanguage.level',
            'userLanguage.languageId',
          ]);
      }

      if (babysitterSpecialServices) {
        query = query.leftJoinAndSelect(
          'user.babysitterSpecialServices',
          'babysitterSpecialService',
        );
      }

      if (userImages) {
        query = query.leftJoinAndSelect('user.userImages', 'userImage');
      }

      const oldUser = await query.getOne();
      if (!oldUser) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      let avatarUrl;
      if (typeof updatedUser.avatar === 'string') {
        avatarUrl = await this.awsClientService.createS3PresignedUrl(
          formatKey({ userId: userId, role: oldUser.role }, updatedUser.avatar),
        );

        const avatar = avatarUrl.split('?')[0];
        updatedUser.avatar = avatar;
      }
      userRepo.merge(oldUser, updatedUser);

      if (typeof updatedUser.active === 'boolean') {
        if (updatedUser.active) {
          oldUser.deletedAt = null;
          oldUser.isActive = true;
          await this.update(
            this.postgresData,
            UserEntity,
            { id: userId },
            { deletedAt: null },
          );
        } else {
          return await this.hardDeleteUserAccountById([userId]);
        }
      }

      const updatedUserResult = await this.create(
        this.postgresData,
        UserEntity,
        oldUser,
      );

      updatedUserResult.avatar = avatarUrl ?? oldUser.avatar;

      if (userLanguages) {
        updatedUserResult.userLanguages = await this.updateUserLanguages(
          oldUser.userLanguages,
          userLanguages,
          userId,
        );
      }

      if (babysitterSpecialServices) {
        updatedUserResult.babysitterSpecialServices =
          await this.updateBabysitterSpecialServices(
            oldUser.babysitterSpecialServices,
            babysitterSpecialServices,
            userId,
          );
      }

      if (userImages) {
        updatedUserResult.userImages = await this.updateUserImages(
          oldUser.userImages,
          userImages,
          { userId: userId, role: oldUser.role },
        );
      }

      return updatedUserResult;
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getParentProfile(parentId: string, lang: ELanguage) {
    try {
      const queryBuilder = this.getRepository(this.postgresData, UserEntity)
        .createQueryBuilder('parent')
        .where('parent.id = :parentId', { parentId })
        .andWhere('parent.role = :role', { role: EUserRole.PARENT })
        .leftJoin('parent.userLanguages', 'userLanguage')
        .leftJoin('userLanguage.language', 'language')
        .leftJoin('parent.userImages', 'userImage')
        .select(['parent.id', 'parent.username', 'parent.email'])
        .addSelect([
          'userLanguage.id',
          'userLanguage.level',
          'userLanguage.languageId',
          'language.id',
          'language.languageCode',
          'userImage.id',
          'userImage.url',
          'userImage.order',
        ]);
      const parent = await queryBuilder
        .orderBy('userImage.order', 'ASC')
        .getOne();

      if (!parent) {
        throw new BadRequestException(errorMessage.NOT_FOUND_ACCOUNT);
      }

      return formatUser(parent, lang);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  private async updateUserLanguages(
    oldUserLanguages: IUpdateUserLanguages[],
    updatedUserLanguages: IUpdateUserLanguages[],
    userId: string,
  ) {
    const languagesToDelete = oldUserLanguages
      .filter(
        (oldLang) =>
          !updatedUserLanguages.some(
            (updatedLang) => updatedLang.id === oldLang.id,
          ),
      )
      .map((oldLang) => oldLang.id);

    await this.delete(this.postgresData, UserLanguageEntity, {
      id: In(languagesToDelete),
    });

    const languagesToSave = updatedUserLanguages.map((lang) =>
      this.createInstance(this.postgresData, UserLanguageEntity, {
        ...lang,
        userId,
      }),
    );

    return (await this.create(
      this.postgresData,
      UserLanguageEntity,
      languagesToSave,
    )) as unknown as UserLanguageEntity[];
  }

  private async updateBabysitterSpecialServices(
    oldBabysitterSpecialServices: IUpdateBabysitterSpecialService[],
    updateBabysitterSpecialServices: IUpdateBabysitterSpecialService[],
    userId: string,
  ) {
    const serviceToDelete = oldBabysitterSpecialServices
      .filter(
        (oldService) =>
          !updateBabysitterSpecialServices.some(
            (updatedService) => updatedService.id === oldService.id,
          ),
      )
      .map((oldService) => oldService.id);

    await this.delete(this.postgresData, BabysitterSpecialServiceEntity, {
      id: In(serviceToDelete),
    });

    const serviceToSave = updateBabysitterSpecialServices.map((service) =>
      this.createInstance(this.postgresData, BabysitterSpecialServiceEntity, {
        ...service,
        userId,
      }),
    );

    return (await this.create(
      this.postgresData,
      BabysitterSpecialServiceEntity,
      serviceToSave,
    )) as unknown as BabysitterSpecialServiceEntity[];
  }

  private async updateUserImages(
    oldUserImages: IUpdateUserImage[],
    updatedUserImages: IUpdateUserImage[],
    reqUser: IRequestUser,
  ) {
    const imagesToDelete = oldUserImages
      .filter(
        (oldImage) =>
          !updatedUserImages.some(
            (updatedImage) => updatedImage.id === oldImage.id,
          ),
      )
      .map((oldImage) => oldImage.id);
    await this.delete(this.postgresData, UserImageEntity, {
      id: In(imagesToDelete),
    });

    const imagesToSave = await Promise.all(
      updatedUserImages.map(async (image, index) => {
        const fullUrl =
          image.url ||
          (await this.awsClientService.createS3PresignedUrl(
            formatKey(reqUser, image.key),
          ));
        const savedUrl = fullUrl.split('?')[0];
        const savedImage = this.createInstance(
          this.postgresData,
          UserImageEntity,
          {
            ...image,
            url: savedUrl,
            userId: reqUser.userId,
            order: index,
          },
        );

        return { savedImage, fullUrl };
      }),
    );

    await this.create(
      this.postgresData,
      UserImageEntity,
      imagesToSave.map(({ savedImage }) => savedImage),
    );

    return imagesToSave.map(({ savedImage, fullUrl }) => ({
      ...savedImage,
      url: fullUrl,
    })) as unknown as UserImageEntity[];
  }

  async getBabysitterForBooking(
    query: IQueryBabysitter,
    reqUser: IRequestUser,
    flagFavorite: boolean = false,
  ) {
    const {
      cityId,
      numberOfExperience,
      salaries,
      languageIds,
      ages,
      sort,
      dates,
      rating,
      page,
      limit,
      lang,
      currencyId,
    } = query;

    const queryBuilder = this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('babysitter')
      .leftJoinAndMapOne(
        'babysitter.avatar',
        'babysitter.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .leftJoinAndMapOne(
        'babysitter.favorite',
        'babysitter.favoriteBabysitters',
        'favorite',
        'favorite.parentId = :parentId',
        { parentId: reqUser.userId },
      )
      .loadRelationCountAndMap(
        'babysitter.countFavorite',
        'babysitter.favoriteBabysitters',
      )
      .loadRelationCountAndMap(
        'babysitter.countCommentRating',
        'babysitter.ratingUser',
        'ratingUser',
        (qb) => qb.innerJoin('ratingUser.comment', 'comment'),
      )
      .leftJoin('babysitter.userLanguages', 'userLanguage')
      .leftJoin('userLanguage.language', 'language')
      .leftJoin('babysitter.currency', 'currency')
      .where('babysitter.role = :role', { role: EUserRole.BABY_SITTER })
      .andWhere('babysitter.completedSignup IS NOT NULL')
      .andWhere('babysitter.allowBooking = :allowBooking', {
        allowBooking: true,
      })
      .select([
        'babysitter.id',
        'babysitter.avgRating',
        'babysitter.numExperience',
        'babysitter.username',
        'babysitter.salary',
        'currency.unit',
        'avatar.url',
        'userLanguage.level',
        'language.languageCode',
        'favorite.id',
      ]);

    if (cityId) {
      queryBuilder.andWhere('babysitter.cityId = :cityId', { cityId });
    }

    if (numberOfExperience) {
      if (numberOfExperience === ENumberOfExperience.UNDER_3_YEARS) {
        queryBuilder.andWhere('babysitter.numExperience = :numExperience', {
          numExperience: numberOfExperience,
        });
      } else {
        queryBuilder.andWhere('babysitter.numExperience >= :numExperience', {
          numExperience: numberOfExperience,
        });
      }
    }

    if (!isEmpty(currencyId)) {
      queryBuilder.andWhere('babysitter.currencyId = :currencyId', {
        currencyId,
      });
    }

    if (!isEmpty(salaries)) {
      queryBuilder.andWhere('babysitter.salary IN (:...salaries)', {
        salaries,
      });
    }

    if (!isEmpty(languageIds)) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('userLanguage.userId')
          .from(UserLanguageEntity, 'userLanguage')
          .andWhere('userLanguage.languageId IN (:...languageIds)', {
            languageIds,
          })
          .groupBy('userLanguage.userId')
          .having('COUNT(*) = :count', { count: languageIds.length })
          .getQuery();
        return 'babysitter.id IN ' + subQuery;
      });
    }

    if (!isEmpty(ages)) {
      if (!isEmpty(ages)) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            ages.forEach((age, index) => {
              const dob40 = getDateOfBirthByAge(EFilterAge.AGE_40);
              const dob20 = getDateOfBirthByAge(EFilterAge.AGE_20);
              const paramName40 = `dob40_${index}`;
              const paramName20 = `dob20_${index}`;

              if (age === EFilterAge.AGE_40) {
                qb.orWhere(`babysitter.dob <= :${paramName40}`, {
                  [paramName40]: dob40,
                });
              } else if (age === EFilterAge.AGE_20) {
                qb.orWhere(`babysitter.dob >= :${paramName20}`, {
                  [paramName20]: dob20,
                });
              } else {
                qb.orWhere(
                  `babysitter.dob > :${paramName20} AND babysitter.dob < :${paramName40}`,
                  {
                    [paramName20]: dob20,
                    [paramName40]: dob40,
                  },
                );
              }
            });
          }),
        );
      }
    }

    if (rating) {
      queryBuilder.andWhere('babysitter.avgRating >= :rating', {
        rating,
      });
    }

    if (!isEmpty(dates)) {
      queryBuilder
        .leftJoin('babysitter.bookings', 'booking')
        .leftJoin(
          'booking.bookingTimes',
          'bookingTime',
          'DATE(bookingTime.startTime) IN (:...dates)',
          {
            dates: dates.map((date) =>
              date instanceof Date ? date.toISOString().split('T')[0] : date,
            ),
          },
        )
        .addSelect(['bookingTime.id'])
        .andWhere('bookingTime.id IS NULL');
    }

    switch (sort) {
      case ESortBabysitter.HIGHEST_SALARY:
        queryBuilder.orderBy('babysitter.salary', 'DESC');
        break;
      case ESortBabysitter.LOWEST_SALARY:
        queryBuilder.orderBy('babysitter.salary', 'ASC');
        break;
      case ESortBabysitter.HIGHEST_RATING:
        // TODO: implement this
        queryBuilder.orderBy('babysitter.avgRating', 'DESC');
        break;
      case ESortBabysitter.MOST_REVIEWED:
        // TODO: implement this
        break;
      default:
        queryBuilder.orderBy('babysitter.createdAt', 'DESC');
        break;
    }

    if (flagFavorite) {
      queryBuilder
        .innerJoin(
          'babysitter.favoriteBabysitters',
          'favoriteCheck',
          'favoriteCheck.parentId = :userId',
          { userId: reqUser.userId },
        )
        .addSelect(['favoriteCheck.createdAt'])
        .orderBy('favoriteCheck.createdAt', 'DESC');
    }

    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const babysitters = results.map((babysitter) => {
      return formatUser(babysitter, lang);
    });
    return { results: babysitters, total };
  }

  async getBabysitters(query: IQueryBabysitter) {
    const { createdAtFrom, createdAtTo, allowBooking, limit, page, lang } =
      query;
    const queryBuilder = this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .leftJoinAndMapOne(
        'user.avatar',
        'user.userImages',
        'avatar',
        'avatar.order = 0',
      )
      .leftJoin('user.city', 'city')
      .where('user.role = :role', { role: EUserRole.BABY_SITTER })
      .andWhere('user.completedSignup IS NOT NULL');

    if (createdAtFrom) {
      queryBuilder.andWhere('user.createdAt >= :createdAtFrom', {
        createdAtFrom,
      });
    } else {
      queryBuilder.andWhere('user.createdAt IS NULL');
    }

    if (createdAtTo) {
      queryBuilder.andWhere('user.createdAt <= :createdAtTo', {
        createdAtTo,
      });
    }

    if (typeof allowBooking === 'boolean') {
      queryBuilder.andWhere('user.allowBooking = :allowBooking', {
        allowBooking,
      });
    }

    queryBuilder
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.phone',
        'user.userCode',
        'user.createdAt',
        'user.allowBooking',
        'avatar.url',
        'city.name',
        'user.dob',
      ])
      .setParameter('lang', lang);

    const [results, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const processedResults: any = results.map((user) => ({
      ...user,
      city: user.city?.name[lang] ?? null,
    }));

    return { results: processedResults, total };
  }

  async updateBabysitterAllowBookingStatus(
    data: UpdateBabysitterAllowBookingStatus,
  ) {
    try {
      const babysitterIds = data.map((user) => user.babysitterId);
      const babysitters = await this.getMany(this.postgresData, UserEntity, {
        where: {
          id: In(babysitterIds),
          role: EUserRole.BABY_SITTER,
          completedSignup: Not(IsNull()),
        },
        select: ['id', 'allowBooking'],
      });

      if (babysitters.length !== data.length) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const allowBookingMap = new Map(
        data.map((item) => [item.babysitterId, item.allowBooking]),
      );

      const updatedBabysitters = babysitters.map((babysitter) => ({
        ...babysitter,
        allowBooking: allowBookingMap.get(babysitter.id),
      }));

      return this.create(this.postgresData, UserEntity, updatedBabysitters);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async updateAllBabysitterAllowBookingStatus() {
    return await this.update(
      this.postgresData,
      UserEntity,
      {
        role: EUserRole.BABY_SITTER,
        allowBooking: false,
        completedSignup: Not(IsNull()),
      },
      { allowBooking: true },
    );
  }

  async createManager(createManager: IManager) {
    const role = await this.getOne(this.postgresData, RoleEntity, {
      where: { name: EUserRole.MANAGER },
    });
    const language = await this.getOne(this.postgresData, LanguageEntity, {
      where: { languageCode: ELanguage.vi },
    });

    if (!role && !language) {
      throw new BadRequestException(errorMessage.NOT_FOUND);
    }

    const password = generatePassword();
    const countManager = await this.count(this.postgresData, UserEntity, {
      where: { role: EUserRole.MANAGER },
      withDeleted: true,
    });

    const manager = await this.create(this.postgresData, UserEntity, {
      username: createManager.username,
      email: createManager.email,
      role: EUserRole.MANAGER,
      phone: createManager.phone,
      settingLanguageId: language.id,
      password: password,
      userCode: generateUserCode(EUserRole.MANAGER, countManager + 1),
      userRole: {
        loginExpirationAt: createManager.loginExpirationAt,
        hasAdminPermission: createManager.hasAdminPermission,
        revokedAt: createManager.revokedAt,
        roleId: role.id,
      },
      userPermissions: createManager.permissionIds.map((permissionId) =>
        this.createInstance(this.postgresData, UserPermissionEntity, {
          permissionId,
        }),
      ),
    });

    let avatarUrl;
    if (typeof createManager.avatar === 'string') {
      avatarUrl = await this.awsClientService.createS3PresignedUrl(
        formatKey(
          { userId: manager.id, role: manager.role },
          createManager.avatar,
        ),
      );

      const avatar = avatarUrl.split('?')[0];
      await this.update(
        this.postgresData,
        UserEntity,
        { id: manager.id },
        {
          avatar: avatar,
        },
      );
    }

    await this.messageBuilder.sendMessage(
      EService.NOTIFY,
      {
        receivers: [manager.email],
        name: 'otp',
        params: { name: '', otp: password },
      },
      { cmd: 'sendEmail' },
    );
    delete manager.password;
    manager.avatar = avatarUrl;

    return manager;
  }

  async checkEmail(email: string, userId?: string) {
    if (!email) {
      return true;
    }

    const isExistEmail = await this.exist(this.postgresData, UserEntity, {
      where: { email: email, ...(userId && { id: Not(userId) }) },
      withDeleted: true,
    });

    if (isExistEmail) {
      throw new BadRequestException(errorMessage.EMAIL_ALREADY_EXISTS);
    }

    return true;
  }

  async updateManager(updateManager: IManager) {
    const manager = await this.getOne(this.postgresData, UserEntity, {
      where: { id: updateManager.id },
      relations: ['userRole'],
    });

    if (!manager) {
      throw new BadRequestException(errorMessage.NOT_FOUND);
    }

    let avatarUrl;
    if (typeof updateManager.avatar === 'string') {
      avatarUrl = await this.awsClientService.createS3PresignedUrl(
        formatKey(
          { userId: manager.id, role: manager.role },
          updateManager.avatar,
        ),
      );

      const avatar = avatarUrl.split('?')[0];
      updateManager.avatar = avatar;
    }

    const managerRepo = this.getRepository(this.postgresData, UserEntity);
    managerRepo.merge(manager, updateManager);

    manager.userRole.hasAdminPermission = updateManager.hasAdminPermission;
    manager.userRole.loginExpirationAt = updateManager.loginExpirationAt;
    manager.userRole.revokedAt = updateManager.revokedAt;

    if (updateManager.permissionIds) {
      manager.userPermissions = (await this.updateManagerPermissions(
        manager.id,
        updateManager.permissionIds,
      )) as unknown as UserPermissionEntity[];
    }

    const result = await managerRepo.save(manager);
    if (avatarUrl) {
      result.avatar = avatarUrl;
    }
    return result;
  }

  private async updateManagerPermissions(
    userId: string,
    permissionIds: string[],
  ) {
    await this.delete(this.postgresData, UserPermissionEntity, {
      userId: userId,
    });

    const userPermissions = permissionIds.map((permissionId) =>
      this.createInstance(this.postgresData, UserPermissionEntity, {
        userId,
        permissionId,
      }),
    );
    return await this.create(
      this.postgresData,
      UserPermissionEntity,
      userPermissions,
    );
  }

  async getManagers(query: IQueryManager) {
    const { q, limit, page, hasAdminPermission } = query;

    const managerQuery = this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('manager')
      .leftJoin('manager.userRole', 'userRole')
      .where('manager.role = :role', { role: EUserRole.MANAGER })
      .select([
        'manager.id',
        'manager.username',
        'manager.email',
        'manager.phone',
        'manager.avatar',
        'manager.createdAt',
        'manager.userCode',
        'userRole.hasAdminPermission',
        'userRole.createdAt',
      ]);

    if (q) {
      managerQuery
        .andWhere(
          new Brackets((qb) =>
            qb
              .orWhere('manager.username ILike :q')
              .orWhere('manager.email ILike :q')
              .orWhere('manager.phone ILike :q'),
          ),
        )
        .setParameters({
          q: `%${q}%`,
        });
    }

    if (typeof hasAdminPermission === 'boolean') {
      managerQuery.andWhere(
        'userRole.hasAdminPermission = :hasAdminPermission',
        { hasAdminPermission },
      );
    }
    const [results, total] = await managerQuery
      .skip(limit * (page - 1))
      .take(limit)
      .orderBy('manager.createdAt', 'DESC')
      .getManyAndCount();

    return { results, total };
  }

  async getManagerById(id: string, lang: ELanguage) {
    const manager = await this.getOne(this.postgresData, UserEntity, {
      where: { id: id },
      relations: ['userRole'],
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        createdAt: true,
        avatar: true,
        userCode: true,
        userRole: {
          hasAdminPermission: true,
          createdAt: true,
          loginExpirationAt: true,
          grantedAt: true,
          revokedAt: true,
        },
      },
    });
    if (!manager) {
      throw new BadRequestException(errorMessage.NOT_FOUND);
    }
    manager.resources = await this.resourceService.getResources(
      lang,
      manager.id,
    );
    return manager;
  }

  async deleteManagerById(id: string) {
    try {
      const manager = await this.getOne(this.postgresData, UserEntity, {
        where: { id: id, role: EUserRole.MANAGER },
      });
      if (!manager) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }
      return await this.softDelete(this.postgresData, UserEntity, {
        id: id,
      });
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async createBabysitter(data: ICreateBabysitter, reqUser: IRequestUser) {
    try {
      const {
        userLanguages,
        babysitterSpecialServices,
        userImages,
        booking,
        ...babysitterData
      } = data;

      await this.checkEmail(babysitterData.email);
      const language = await this.getOne(this.postgresData, LanguageEntity, {
        where: {},
      });

      const { images, urlPresigned } = await this.processUserImages(userImages);
      const countUserByRole = await this.count(this.postgresData, UserEntity, {
        where: { role: EUserRole.BABY_SITTER },
        withDeleted: true,
      });

      const babysitter = await this.create(this.postgresData, UserEntity, {
        ...babysitterData,
        userCode: generateUserCode(EUserRole.BABY_SITTER, countUserByRole + 1),
        role: EUserRole.BABY_SITTER,
        allowBooking: true,
        settingLanguageId: language.id,
        userLanguages: this.createUserLanguages(userLanguages),
        babysitterSpecialServices: this.createSpecialServices(
          babysitterSpecialServices,
        ),
        userImages: images,
        completedSignup: new Date(),
      });

      babysitter?.userImages.map((image, index) => {
        image.url = urlPresigned[index];
      });

      let commentImages = null;
      if (booking) {
        commentImages = await this.createBooking(booking, reqUser, babysitter);
      }

      return { ...babysitter, commentImages };
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  private async createBooking(
    booking: IBookingAdmin,
    reqUser: IRequestUser,
    babysitter: UserEntity,
  ) {
    const { bookingTimes, reviewIds, point, comment, commentImages } = booking;
    this.messageBuilder.sendMessage(
      EService.BOOKING,
      {
        data: {
          numOfChildrenCared: ENumOfChildrenCared.ONE,
          bookingTimes: bookingTimes,
          status: EBookingStatus.COMPLETED,
          babysitterId: babysitter.id,
          cityId: babysitter.cityId,
          countryId: babysitter.countryId,
        },
        reqUser,
      },
      { cmd: 'createBooking' },
    );

    if (!isEmpty(reviewIds)) {
      const instances = reviewIds.flatMap((reviewId) =>
        Array(MINIMUM_REVIEW_COUNT)
          .fill(null)
          .map(() =>
            this.createInstance(this.postgresData, ReviewBabysitterEntity, {
              reviewId,
              babysitterId: babysitter.id,
            }),
          ),
      );

      this.create(this.postgresData, ReviewBabysitterEntity, instances);
    }

    let fileUrls = [];
    let urlResults = [];
    if (!isEmpty(commentImages)) {
      urlResults = await this.awsClientService.createS3PresignedUrlList(
        {
          userId: EBabysitterType.VIRTUAL_BABYSITTER,
          role: EUserRole.BABY_SITTER,
        },
        commentImages,
      );
      fileUrls = urlResults.map((file) =>
        this.createInstance(this.postgresData, RatingCommentImageEntity, {
          url: file.url,
        }),
      );
    }

    this.create(this.postgresData, RatingUserEntity, {
      point: point,
      babysitterId: babysitter.id,
      comment: {
        content: comment,
        images: fileUrls,
      },
    });

    return urlResults.map((file) => file.urlPresigned);
  }

  private async processUserImages(userImages: IUserImage[]) {
    if (isEmpty(userImages)) return { images: [], urlPresigned: [] };

    const keys = userImages.map((image) => image.key);
    const presignedData = await this.awsClientService.createS3PresignedUrlList(
      {
        userId: EBabysitterType.VIRTUAL_BABYSITTER,
        role: EUserRole.BABY_SITTER,
      },
      keys,
    );

    const images = presignedData.map((data, index) =>
      this.createInstance(this.postgresData, UserImageEntity, {
        url: data.url,
        order: index,
      }),
    );

    const urlPresigned = presignedData.map((data) => data.urlPresigned);
    return { images, urlPresigned };
  }

  private createUserLanguages(
    userLanguages?: IUserLanguage[],
  ): UserLanguageEntity[] {
    return userLanguages?.map((lang) =>
      this.createInstance(this.postgresData, UserLanguageEntity, {
        languageId: lang.languageId,
        level: lang.level,
      }),
    );
  }

  private createSpecialServices(
    specialServices?: IBabysitterSpecialService[],
  ): BabysitterSpecialServiceEntity[] {
    return specialServices?.map((specialService) =>
      this.createInstance(this.postgresData, BabysitterSpecialServiceEntity, {
        specialServiceId: specialService.specialServiceId,
      }),
    );
  }

  async deleteAccount(reqUser: IRequestUser) {
    return this.softDelete(this.postgresData, UserEntity, {
      id: reqUser.userId,
    });
  }

  async toggleBabysitterFavorite(reqUser: IRequestUser, babysitterId: string) {
    if (reqUser.role !== EUserRole.PARENT) {
      return false;
    }

    const babysitter = await this.getOne(this.postgresData, UserEntity, {
      where: { id: babysitterId, role: EUserRole.BABY_SITTER },
    });

    if (!babysitter) {
      return false;
    }

    const likedBabysitter = await this.getOne(
      this.postgresData,
      FavoriteBabysitterEntity,
      {
        where: {
          babysitterId: babysitterId,
          parentId: reqUser.userId,
        },
      },
    );

    if (likedBabysitter) {
      await this.delete(this.postgresData, FavoriteBabysitterEntity, {
        id: likedBabysitter.id,
      });
      return true;
    } else {
      await this.create(this.postgresData, FavoriteBabysitterEntity, {
        babysitterId: babysitter.id,
        parentId: reqUser.userId,
      });
      return true;
    }
  }

  async hardDeleteUserAccountById(ids: string[]) {
    try {
      return await this.delete(this.postgresData, UserEntity, {
        id: In(ids),
      });
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
