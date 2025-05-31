import { SetMetadata } from '@nestjs/common';
import { guardScopes } from '../constants';

export const HasAdminPermission = () =>
  SetMetadata(guardScopes.hasAdminPermission, true);
