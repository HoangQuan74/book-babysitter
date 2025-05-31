import { IQuery } from '.';

export interface IManager {
  id?: string;
  avatar?: string;
  username: string;
  email: string;
  phone: string;
  hasAdminPermission?: boolean;
  loginExpirationAt: Date;
  revokedAt: Date;
  permissionIds: string[];
}

export interface IQueryManager extends IQuery {
  hasAdminPermission?: boolean;
}

export interface IPermission {
  userId: string;
  permissionName: string;
}
