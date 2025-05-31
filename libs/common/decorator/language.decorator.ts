import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ELanguage, EUserRole } from '../enums';
import { errorMessage } from '../constants';

export const LanguageCode = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let LanguageCode = request.headers['x-lang-code'];
    if (!LanguageCode) {
      const app = request.headers['x-app-name'];
      LanguageCode = app == EUserRole.BABY_SITTER ? ELanguage.vi : ELanguage.ko;
    }
    if (!Object.values(ELanguage).includes(LanguageCode as ELanguage)) {
      throw new BadRequestException(errorMessage.LANGUAGE_NOT_SUPPORTED);
    }
    return LanguageCode;
  },
);
