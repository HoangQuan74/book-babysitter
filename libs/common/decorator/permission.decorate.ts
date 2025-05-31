import { SetMetadata } from '@nestjs/common';
import { guardScopes } from '../constants';

export const Permission = (key: string) =>
  SetMetadata(guardScopes.permission, key);
