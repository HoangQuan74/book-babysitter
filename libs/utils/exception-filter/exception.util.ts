import { HttpStatus } from '@nestjs/common';

export class ExceptionUtil extends Error {
  private formattedError;
  constructor(error: any) {
    super(error.message);
    this.formattedError = {
      errorCode:
        typeof error?.status == 'number'
          ? error?.status
          : HttpStatus.INTERNAL_SERVER_ERROR,
      errorMessage: error?.message,
    };
  }
  public errorHandler() {
    return this.formattedError;
  }
}
