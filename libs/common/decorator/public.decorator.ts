import { SetMetadata } from '@nestjs/common';
import { guardScopes } from '../constants';

export const Public = () => SetMetadata(guardScopes.isPublic, true);
