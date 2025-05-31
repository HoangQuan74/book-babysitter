import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

const getErrorMessage = <T>(exception: T): Array<T> | T => {
  return exception instanceof HttpException
    ? exception['response']['message']
    : exception;
};

@Catch()
export class GatewayExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const lang = request.headers['x-lang-code'] || 'en';
    const statusCode = getStatusCode<T>(exception);
    const errors = getErrorMessage<T>(exception);
    let message = errors as string;

    try {
      const i18n = I18nContext.current(host);
      message = i18n.service.translate(
        `${lang}.${errors['message'] || errors}`,
        {
          lang: lang,
          defaultValue: errors as string,
        },
      );
    } catch (error) {}

    response.status(statusCode).json({
      statusCode,
      data: null,
      message: message,
    });
  }
}
