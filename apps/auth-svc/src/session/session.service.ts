import {
  DbName,
  ELanguage,
  EOtpType,
  EService,
  ETermDisplayStatus,
  ETypePoint,
  EUserRole,
} from '@lib/common/enums';
import {
  IBabysitterSpecialService,
  ILogin,
  IRequestPasswordReset,
  IResendOtp,
  IResetPassword,
  ISetPassword,
  ISignup,
  IUserLanguage,
  IUserTerm,
  IVerifyOtp,
  IVerifyResetOtp,
  IVerifySignUpOtp,
} from '@lib/common/interfaces';
import {
  CityEntity,
  CurrencyEntity,
  LanguageEntity,
  LoginSessionEntity,
  SocialAccountEntity,
  SpecialServiceEntity,
  TermEntity,
  UserEntity,
  UserOtpEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Not } from 'typeorm';
import { isEmpty } from 'lodash';
import {
  errorMessage,
  mutationResult,
  mutationResultFail,
} from '@lib/common/constants';
import {
  comparePassword,
  convertTime,
  formatUser,
  generateOtp,
  generateUserCode,
  hashPassword,
  isOtpGenerationAllowed,
  JwtUtil,
} from '@lib/utils';
import * as randomatic from 'randomatic';
import { MessageBuilder } from '@lib/core/message-builder';
import { ConfigService } from '@nestjs/config';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { runInThisContext } from 'vm';
import { identity } from 'rxjs';

@Injectable()
export class SessionService extends BaseRepository {
  private readonly jwtUtil: JwtUtil;
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    private readonly messageBuilder: MessageBuilder,
    private readonly configService: ConfigService,
  ) {
    super();
    this.jwtUtil = new JwtUtil();
  }

  async login(data: ILogin) {
    try {
      const { email, password } = data;
      const user = await this.getOne(this.postgresData, UserEntity, {
        where: { email, role: In([EUserRole.ADMIN, EUserRole.MANAGER]) },
        select: {
          id: true,
          password: true,
          email: true,
          username: true,
          role: true,
          userRole: { loginExpirationAt: true },
        },
        relations: ['userRole'],
      });
      if (isEmpty(user))
        throw new NotFoundException(errorMessage.NOT_FOUND_ACCOUNT);
      if (!comparePassword(password, user.password))
        throw new UnauthorizedException(errorMessage.PASSWORD_NOT_MATCH);

      if (user.role === EUserRole.MANAGER) {
        if (user.userRole.loginExpirationAt < new Date()) {
          throw new UnauthorizedException(errorMessage.ACCOUNT_EXPIRED);
        }
      }
      const otp = generateOtp(6).toUpperCase();
      await Promise.all([
        this.create(this.postgresData, UserOtpEntity, {
          userId: user.id,
          otp,
          email: user.email,
          type: EOtpType.ADMIN_LOGIN,
        }),
        this.messageBuilder.sendMessage(
          EService.NOTIFY,
          {
            receivers: [user.email],
            name: 'otp_login',
            params: { name: user?.username || '', otp },
          },
          { cmd: 'sendEmail' },
        ),
      ]);
      return { userId: user.id };
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async loginUser(data: ILogin) {
    try {
      const { email, password, app } = data;
      const user = await this.getOne(this.postgresData, UserEntity, {
        where: { email, role: Not(In([EUserRole.ADMIN, EUserRole.MANAGER])) },
        withDeleted: true,
        select: [
          'id',
          'password',
          'email',
          'role',
          'username',
          'isActive',
          'deletedAt',
        ],
      });

      if (isEmpty(user))
        throw new NotFoundException(errorMessage.EMAIL_NOT_REGISTERED);
      await this.softDelete(this.postgresData, LoginSessionEntity, {
        userId: user.id,
      });
      if (user.deletedAt)
        throw new BadRequestException(errorMessage.ACCOUNT_IS_DELETED);
      if (!comparePassword(password, user.password))
        throw new UnauthorizedException(errorMessage.PASSWORD_NOT_MATCH);
      if (!user.isActive) throw new BadRequestException(errorMessage.UN_ACTIVE);
      if (user.role !== app) {
        throw new BadRequestException(errorMessage.ROLE_NOT_VALID);
      }
      if (user.role === EUserRole.BABY_SITTER) {
        this.messageBuilder.sendMessage(
          EService.POINT,
          { babysitterId: user.id, type: ETypePoint.LOGIN },
          { cmd: 'addPoint' },
        );
      }
      return this.generateToken(user);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async googleAuthRedirect(data) {
    try {
      const { email, provider, id: socialId, userRole, languageCode } = data;
      const [socialAccount, user] = await Promise.all([
        this.getOne(this.postgresData, SocialAccountEntity, {
          where: {
            email,
          },
        }),
        this.getOne(this.postgresData, UserEntity, {
          where: {
            email,
          },
          relations: {
            socialAccount: true,
          },
        }),
      ]);
      if (socialAccount && socialAccount.provider !== provider)
        throw new ConflictException('Account registered');
      if (isEmpty(user)) {
        const [language, countUserByRole] = await Promise.all([
          this.getOne(this.postgresData, LanguageEntity, {
            where: { languageCode },
          }),
          this.count(this.postgresData, UserEntity, {
            withDeleted: true,
            role: userRole,
          }),
        ]);
        const newUser = await this.create(this.postgresData, UserEntity, {
          email: email,
          settingLanguageId: language.id,
          role: userRole || EUserRole.BABY_SITTER,
          isActive: false,
          userCode: generateUserCode(userRole, countUserByRole + 1),
        });
        await this.create(this.postgresData, SocialAccountEntity, {
          userId: newUser.id,
          socialId,
          provider,
          email,
        });
        return newUser;
      }
      if (user.socialAccount.socialId !== socialId) {
        throw new ConflictException('Account registered');
      }
      const token = await this.generateToken(user);
      return { ...token, userId: user.id };
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async socialCallback(data) {
    try {
      const { email, provider, socialId, userRole, languageCode } = data;
      const [socialAccount, user] = await Promise.all([
        this.getOne(this.postgresData, SocialAccountEntity, {
          where: {
            email,
          },
        }),
        this.getOne(this.postgresData, UserEntity, {
          where: {
            email,
          },
          relations: {
            socialAccount: true,
          },
        }),
      ]);

      if (socialAccount && socialAccount.provider != provider) {
        throw new ConflictException('Account registered');
      }
      if (isEmpty(user)) {
        const [language, countUserByRole] = await Promise.all([
          this.getOne(this.postgresData, LanguageEntity, {
            where: { languageCode },
          }),
          this.count(this.postgresData, UserEntity, {
            withDeleted: true,
            role: userRole,
          }),
        ]);
        const newUser = await this.create(this.postgresData, UserEntity, {
          email: email,
          settingLanguageId: language.id,
          role: userRole || EUserRole.BABY_SITTER,
          isActive: false,
          userCode: generateUserCode(userRole, countUserByRole + 1),
        });
        await this.create(this.postgresData, SocialAccountEntity, {
          userId: newUser.id,
          socialId,
          provider,
          email,
        });
        const token = await this.generateToken(newUser);
        return { ...token, ...newUser };
      }
      if (socialAccount.socialId != socialId) {
        throw new ConflictException('Account registered');
      }
      const token = await this.generateToken(user);
      return { ...token, userId: user.id };
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getUserSession(data) {
    const { userId, sessionId } = data;
    return this.getOne(this.postgresData, LoginSessionEntity, {
      where: {
        userId,
        id: sessionId,
      },
      select: ['secretKey'],
    });
  }
  private async generateToken(user) {
    const secretKey = randomatic('Aa0', 10);
    const jwtConfig = this.configService.get('jwt');
    const accessExpired = convertTime(jwtConfig.accessExpired);
    const refreshExpired = convertTime(jwtConfig.refreshExpired);
    const session = await this.create(this.postgresData, LoginSessionEntity, {
      userId: user.id,
      secretKey,
      refreshToken: randomatic('Aa0', 30),
    });
    const accessToken = this.jwtUtil.generate(
      {
        userId: user.id,
        role: user.role,
        username: user.username,
        sessionId: session.id,
        exp: accessExpired,
      },
      secretKey,
    );
    return {
      accessToken,
      accessExpired,
      refreshToken: session.refreshToken,
      refreshExpired,
      tokenType: 'Bearer',
      scope: 'auth',
    };
  }

  async verifyOtp(data: IVerifyOtp) {
    try {
      const { userId, otp } = data;
      const userOtp = await this.getOne(this.postgresData, UserOtpEntity, {
        where: {
          userId,
          otp: otp.toUpperCase(),
          isActive: true,
          type: EOtpType.ADMIN_LOGIN,
        },
      });
      if (isEmpty(userOtp))
        throw new NotFoundException(errorMessage.OTP_NOT_NOT_CORRECT);
      const [user, _] = await Promise.all([
        this.getOne(this.postgresData, UserEntity, {
          where: { id: userId },
        }),
        this.update(
          this.postgresData,
          UserOtpEntity,
          { id: userOtp.id },
          { isActive: false },
        ),
      ]);
      return this.generateToken(user);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }
  async refreshToken(data) {
    try {
      const { refreshToken } = data;
      const session = await this.getOne(this.postgresData, LoginSessionEntity, {
        where: {
          refreshToken,
        },
        select: ['id', 'userId'],
      });
      if (isEmpty(session)) throw new NotFoundException();
      const [user, _] = await Promise.all([
        this.getOne(this.postgresData, UserEntity, {
          where: {
            id: session.userId,
          },
        }),
        this.softDelete(this.postgresData, LoginSessionEntity, {
          id: session.id,
        }),
      ]);
      if (isEmpty(user)) throw new NotFoundException();
      return this.generateToken(user);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async logout(data) {
    try {
      const { refreshToken } = data.body;
      const { sessionId } = data.user;
      return this.softDelete(this.postgresData, LoginSessionEntity, {
        id: sessionId,
        refreshToken,
      });
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async registerEmail(email: string) {
    try {
      const isExistEmail = await this.exist(this.postgresData, UserEntity, {
        where: { email: email },
        withDeleted: true,
      });
      if (isExistEmail)
        throw new BadRequestException(errorMessage.EMAIL_ALREADY_EXISTS);

      await this.update(
        this.postgresData,
        UserOtpEntity,
        { email: email },
        { isActive: false },
      );

      const otp = generateOtp(6).toUpperCase();
      const [_, mailRes] = await Promise.all([
        this.create(this.postgresData, UserOtpEntity, {
          otp,
          email: email,
          type: EOtpType.USER_SIGNUP,
        }),
        this.messageBuilder.sendMessage(
          EService.NOTIFY,
          {
            receivers: [email],
            name: 'otp_verify',
            params: { name: '', otp },
          },
          { cmd: 'sendEmail' },
        ),
      ]);
      return mailRes;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async verifySignupOtp(data: IVerifySignUpOtp) {
    try {
      const { email, otp } = data;

      const userOtp = await this.getOne(this.postgresData, UserOtpEntity, {
        where: {
          email,
          otp: otp.toUpperCase(),
          isActive: true,
          type: EOtpType.USER_SIGNUP,
        },
      });

      if (isEmpty(userOtp)) {
        throw new NotFoundException(errorMessage.OTP_NOT_NOT_CORRECT);
      }

      return true;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async resendOtp(data: IResendOtp) {
    const { email, type } = data;

    try {
      const lastOtp = await this.getOne(this.postgresData, UserOtpEntity, {
        where: { email, type },
        order: { createdAt: 'DESC' },
      });

      if (lastOtp && !isOtpGenerationAllowed(lastOtp.createdAt)) {
        throw new BadRequestException(errorMessage.OTP_NOT_ALLOWED);
      }
      let templateName = 'otp';
      switch (type) {
        case EOtpType.ADMIN_LOGIN:
          templateName = 'otp_login';
          await this.checkOtpAdminLogin(email);
          break;
        case EOtpType.USER_SIGNUP:
          templateName = 'otp_verify';
          await this.checkOtpUserSignUp(email);
          break;
        case EOtpType.USER_RESET_PASSWORD:
          templateName = 'otp_reset';
          await this.checkOtpUserResetPassword(email);
          break;
        default:
          throw new BadRequestException(errorMessage.BAD_REQUEST);
      }

      const otp = generateOtp(6).toUpperCase();

      await this.update(
        this.postgresData,
        UserOtpEntity,
        { email, type: type },
        { isActive: false },
      );

      await Promise.all([
        this.create(this.postgresData, UserOtpEntity, {
          otp,
          email,
          type,
        }),
        this.messageBuilder.sendMessage(
          EService.NOTIFY,
          {
            receivers: [email],
            name: templateName,
            params: { name: '', otp },
          },
          { cmd: 'sendEmail' },
        ),
      ]);

      return true;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  private async checkOtpAdminLogin(email: string) {
    const user = await this.getOne(this.postgresData, UserEntity, {
      where: { email, role: EUserRole.ADMIN },
    });
    if (!user) throw new NotFoundException(errorMessage.NOT_FOUND);
  }

  private async checkOtpUserSignUp(email: string) {
    const user = await this.getOne(this.postgresData, UserEntity, {
      where: { email },
    });
    if (user) throw new NotFoundException(errorMessage.EMAIL_ALREADY_EXISTS);
  }

  private async checkOtpUserResetPassword(email: string) {
    const user = await this.getOne(this.postgresData, UserEntity, {
      where: { email, role: Not(EUserRole.ADMIN) },
    });
    if (!user) throw new NotFoundException(errorMessage.NOT_FOUND);
  }

  async setPassword(data: ISetPassword) {
    const { email, password, userRole, languageCode, otp } = data;
    try {
      const userOtp = await this.getOne(this.postgresData, UserOtpEntity, {
        where: {
          otp: otp.toUpperCase(),
          isActive: true,
          email: email,
          type: EOtpType.USER_SIGNUP,
        },
      });

      if (!userOtp)
        throw new BadRequestException(errorMessage.EMAIL_AND_OTP_NOT_MATCH);

      await this.update(
        this.postgresData,
        UserOtpEntity,
        { id: userOtp.id },
        { isActive: false },
      );

      const language = await this.getOne(this.postgresData, LanguageEntity, {
        where: { languageCode: languageCode },
      });

      if (!language) {
        throw new BadRequestException(errorMessage.LANGUAGE_NOT_SUPPORTED);
      }

      const countUserByRole = await this.getCurrentUserByRole(userRole);

      const user = await this.create(this.postgresData, UserEntity, {
        email: email,
        settingLanguageId: language.id,
        role: userRole,
        isActive: true,
        userCode: generateUserCode(userRole, countUserByRole + 1),
        password: password,
      });

      return this.generateToken(user);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getCurrentUserByRole(userRole: EUserRole) {
    const result = await this.getRepository(this.postgresData, UserEntity)
      .createQueryBuilder('user')
      .withDeleted()
      .select('MAX(user.userCode)', 'userCode')
      .where('user.role = :userRole', { userRole })
      .getRawOne();

    if (!result?.userCode) return 0;

    const numericPart = result.userCode.slice(-8);
    const decimalNumber = parseInt(numericPart, 10);
    return decimalNumber;
  }

  async signup(data: ISignup, lang: ELanguage) {
    try {
      const {
        id,
        userLanguages,
        userTerms,
        userImages,
        babysitterSpecialServices,
        ...userData
      } = data;
      const user = await this.getOne(this.postgresData, UserEntity, {
        where: { id, role: Not(EUserRole.ADMIN) },
        relations: ['userImages', 'babysitterSpecialServices', 'userTerms'],
      });

      if (!user) throw new NotFoundException();
      if (user.isActive && user.completedSignup) {
        throw new BadRequestException(errorMessage.CANNOT_UPDATED);
      }

      await Promise.all([
        this.validateCity(userData.cityId),
        this.validateLanguages(userLanguages),
        this.validateTerms(userTerms, user.settingLanguageId),
        this.validateSpecialService(babysitterSpecialServices),
      ]);
      const images = userImages.map((image) => {
        const url = image.url.split('?')[0];
        return { ...image, url };
      });

      const userRepo = this.getRepository(this.postgresData, UserEntity);
      userRepo.merge(user, {
        ...userData,
        completedSignup: user.completedSignup ?? userData.completedSignup,
        isActive: true,
        userLanguages,
        userTerms,
        userImages: images,
        babysitterSpecialServices,
      });

      const result = await this.create(this.postgresData, UserEntity, user);
      formatUser(result, lang);
      return { ...result, userImages };
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async validateCity(cityId?: string): Promise<void> {
    if (cityId) {
      const isValidCity = await this.exist(this.postgresData, CityEntity, {
        where: { id: cityId },
      });
      if (!isValidCity) {
        throw new BadRequestException(errorMessage.BAD_REQUEST);
      }
    }
  }

  async validateLanguages(userLanguages: IUserLanguage[]): Promise<void> {
    if (userLanguages?.length) {
      const validLanguages = await this.getMany(
        this.postgresData,
        LanguageEntity,
        {
          where: { id: In(userLanguages.map((lang) => lang.languageId)) },
          select: ['id'],
        },
      );

      if (validLanguages.length !== userLanguages.length) {
        throw new BadRequestException(errorMessage.BAD_REQUEST);
      }
    }
  }

  async validateTerms(
    userTerms: IUserTerm[],
    languageId: string,
  ): Promise<void> {
    const validTerms = await this.getMany(this.postgresData, TermEntity, {
      where: {
        id: In(userTerms?.map((term) => term.termId)),
        displayStatus: ETermDisplayStatus.DISPLAY,
        languageId: languageId,
      },
      select: ['id', 'isRequired'],
    });

    const isValid =
      validTerms.length === userTerms.length &&
      validTerms.every((term) => {
        const userTerm = userTerms.find((ut) => ut.termId === term.id);
        return !term.isRequired || (userTerm && userTerm.isAgreed);
      });

    if (!isValid) {
      throw new BadRequestException(errorMessage.BAD_REQUEST);
    }
  }

  async validateSpecialService(
    babysitterSpecialServices: IBabysitterSpecialService[],
  ): Promise<void> {
    if (babysitterSpecialServices?.length) {
      const validServices = await this.getMany(
        this.postgresData,
        SpecialServiceEntity,
        {
          where: {
            id: In(
              babysitterSpecialServices.map((svc) => svc.specialServiceId),
            ),
          },
          select: ['id'],
        },
      );

      if (validServices.length !== babysitterSpecialServices.length) {
        throw new BadRequestException(errorMessage.BAD_REQUEST);
      }
    }
  }

  async validateCurrency(currencyId: string): Promise<void> {
    if (currencyId) {
      const isValid = await this.exist(this.postgresData, CurrencyEntity, {
        where: { id: currencyId },
      });
      if (!isValid) {
        throw new BadRequestException(errorMessage.BAD_REQUEST);
      }
    }
  }

  async forgotPassword({ email }: IRequestPasswordReset) {
    try {
      const user = await this.getOne(this.postgresData, UserEntity, {
        where: { email, isActive: true },
      });

      if (!user) {
        throw new NotFoundException(errorMessage.EMAIL_NOT_REGISTERED);
      }

      const otp = generateOtp(6).toUpperCase();
      await Promise.all([
        this.create(this.postgresData, UserOtpEntity, {
          otp: otp,
          email: email,
          userId: user.id,
          type: EOtpType.USER_RESET_PASSWORD,
        }),
        this.messageBuilder.sendMessage(
          EService.NOTIFY,
          {
            receivers: [email],
            name: 'otp_reset',
            params: { name: '', otp },
          },
          { cmd: 'sendEmail' },
        ),
      ]);

      return true;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async verifyOtpForgotPassword({ email, otp }: IVerifyResetOtp) {
    try {
      const otpValid = await this.getOne(this.postgresData, UserOtpEntity, {
        where: {
          otp: otp.toUpperCase(),
          email,
          type: EOtpType.USER_RESET_PASSWORD,
          isActive: true,
        },
      });

      if (!otpValid) {
        throw new NotFoundException();
      }

      await this.update(
        this.postgresData,
        UserOtpEntity,
        { id: otpValid.id },
        { isActive: false },
      );

      return true;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async resetPassword({ email, otp, newPassword }: IResetPassword) {
    try {
      const isExistOtp = await this.exist(this.postgresData, UserOtpEntity, {
        where: {
          otp: otp.toUpperCase(),
          email,
          type: EOtpType.USER_RESET_PASSWORD,
        },
      });

      if (!isExistOtp) {
        throw new NotFoundException();
      }

      const user = await this.getOne(this.postgresData, UserEntity, {
        where: { email, isActive: true },
      });
      user.password = newPassword;
      await this.create(this.postgresData, UserEntity, user);
      return true;
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }
}
