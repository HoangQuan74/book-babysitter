import { Controller } from '@nestjs/common';
import { AccountService } from './account.service';
import { MessagePattern } from '@nestjs/microservices';
import { ELanguage, ETypeSearchUser, EUserRole } from '@lib/common/enums';
import {
  ICreateBabysitter,
  IManager,
  IQuery,
  IQueryBabysitter,
  IQueryManager,
  IQueryUser,
  IRequestUser,
  IUpdateUser,
  UpdateBabysitterAllowBookingStatus,
} from '@lib/common/interfaces';
import { SessionService } from '../session/session.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { PermissionService } from '../permission/permission.service';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly sessionService: SessionService,
    private readonly permissionService: PermissionService,
  ) {}
  @MessagePattern({
    cmd: AccountController.prototype.getProfile.name,
  })
  getProfile({
    reqUser,
    langCode,
  }: {
    reqUser: IRequestUser;
    langCode: ELanguage;
  }) {
    return this.accountService.getProfile(reqUser, langCode);
  }

  @MessagePattern({
    cmd: AccountController.prototype.getUserDeleted.name,
  })
  getUserDeleted(payload: { query: any }) {
    const { query } = payload;
    return this.accountService.getUserDeleted(query);
  }

  @MessagePattern({
    cmd: AccountController.prototype.getUserByUserCode.name,
  })
  getUserByUserCode(query: any) {
    return this.accountService.getUserByUserCode(query);
  }

  @MessagePattern({
    cmd: AccountController.prototype.getProfileUser.name,
  })
  getProfileUser({
    lang,
    reqUser,
    search,
  }: {
    lang: ELanguage;
    reqUser: IRequestUser;
    search?: IQueryUser;
  }) {
    return this.accountService.getProfileUser(lang, reqUser, search);
  }

  @MessagePattern({
    cmd: AccountController.prototype.getReviewOfBabysitters.name,
  })
  getReviewOfBabysitters({
    reqUser,
    query,
  }: {
    reqUser: IRequestUser;
    query: IQuery;
  }) {
    return this.accountService.getReviewOfBabysitters(reqUser, query);
  }

  @MessagePattern({
    cmd: AccountController.prototype.getProfileUserByUserId.name,
  })
  getProfileUserByUserId(payload: {
    userId: string;
    lang: ELanguage;
    reqUser: IRequestUser;
  }) {
    const { userId, lang, reqUser } = payload;
    const search: IQueryUser = {
      identifier: userId,
      type: ETypeSearchUser.ID,
    };
    return this.accountService.getProfileUser(lang, reqUser, search);
  }

  @MessagePattern({
    cmd: AccountController.prototype.updateProfile.name,
  })
  async updateProfile({
    reqUser,
    data,
  }: {
    reqUser: IRequestUser;
    data: IUpdateUser;
  }) {
    try {
      await Promise.all([
        this.sessionService.validateCity(data.cityId),
        this.sessionService.validateLanguages(data.userLanguages),
        this.sessionService.validateSpecialService(
          data.babysitterSpecialServices,
        ),
        this.sessionService.validateCurrency(data.currencyId),
      ]);
      return this.accountService.updateProfile(reqUser, data);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  @MessagePattern({
    cmd: AccountController.prototype.getParentProfile.name,
  })
  async getParentProfile(payload: { parentId: string; lang: ELanguage }) {
    const { parentId, lang } = payload;
    return this.accountService.getParentProfile(parentId, lang);
  }

  @MessagePattern({
    cmd: AccountController.prototype.getBabysitters.name,
  })
  async getBabysitters(query: IQueryBabysitter) {
    return this.accountService.getBabysitters(query);
  }

  @MessagePattern({
    cmd: AccountController.prototype.updateBabysitterAllowBookingStatus.name,
  })
  async updateBabysitterAllowBookingStatus(
    data: UpdateBabysitterAllowBookingStatus,
  ) {
    return this.accountService.updateBabysitterAllowBookingStatus(data);
  }

  @MessagePattern({
    cmd: AccountController.prototype.updateAllBabysitterAllowBookingStatus.name,
  })
  async updateAllBabysitterAllowBookingStatus() {
    return this.accountService.updateAllBabysitterAllowBookingStatus();
  }

  @MessagePattern({
    cmd: AccountController.prototype.getBabysitterForBooking.name,
  })
  async getBabysitterForBooking(payload: {
    query: IQueryBabysitter;
    reqUser: IRequestUser;
  }) {
    const { query, reqUser } = payload;
    return this.accountService.getBabysitterForBooking(query, reqUser);
  }

  @MessagePattern({
    cmd: AccountController.prototype.createManager.name,
  })
  async createManager(createManager: IManager) {
    try {
      await Promise.all([
        this.permissionService.validatePermission(createManager.permissionIds),
        this.accountService.checkEmail(createManager.email),
      ]);
      return this.accountService.createManager(createManager);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  @MessagePattern({
    cmd: AccountController.prototype.updateManager.name,
  })
  async updateManager(updateManager: IManager) {
    try {
      await Promise.all([
        this.permissionService.validatePermission(updateManager.permissionIds),
        this.accountService.checkEmail(updateManager.email, updateManager.id),
      ]);
      return this.accountService.updateManager(updateManager);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  @MessagePattern({
    cmd: AccountController.prototype.getManagers.name,
  })
  async getManagers(query: IQueryManager) {
    try {
      return this.accountService.getManagers(query);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  @MessagePattern({
    cmd: AccountController.prototype.getManagerById.name,
  })
  async getManagerById({ id, lang }: { id: string; lang: ELanguage }) {
    try {
      return this.accountService.getManagerById(id, lang);
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  @MessagePattern({
    cmd: AccountController.prototype.deleteManagerById.name,
  })
  async deleteManagerById(managerId: string) {
    return this.accountService.deleteManagerById(managerId);
  }

  @MessagePattern({
    cmd: AccountController.prototype.createBabysitter.name,
  })
  createBabysitter(payload: {
    data: ICreateBabysitter;
    reqUser: IRequestUser;
  }) {
    const { data, reqUser } = payload;
    return this.accountService.createBabysitter(data, reqUser);
  }

  @MessagePattern({
    cmd: AccountController.prototype.deleteAccount.name,
  })
  deleteAccount(payload: { reqUser: IRequestUser }) {
    const { reqUser } = payload;
    return this.accountService.deleteAccount(reqUser);
  }

  @MessagePattern({
    cmd: AccountController.prototype.getBabysitterFavorites.name,
  })
  getBabysitterFavorites(payload: {
    reqUser: IRequestUser;
    query: IQueryBabysitter;
  }) {
    const { reqUser, query } = payload;
    const getFavoriteBabysitter = true;
    return this.accountService.getBabysitterForBooking(
      query,
      reqUser,
      getFavoriteBabysitter,
    );
  }

  @MessagePattern({
    cmd: AccountController.prototype.toggleBabysitterFavorite.name,
  })
  toggleBabysitterFavorite(payload: {
    reqUser: IRequestUser;
    babysitterId: string;
  }) {
    const { reqUser, babysitterId } = payload;
    return this.accountService.toggleBabysitterFavorite(reqUser, babysitterId);
  }

  @MessagePattern({
    cmd: AccountController.prototype.hardDeleteUserByIds.name,
  })
  hardDeleteUserByIds(payload: { userIds: string[] }) {
    const { userIds } = payload;
    return this.accountService.hardDeleteUserAccountById(userIds);
  }
}
