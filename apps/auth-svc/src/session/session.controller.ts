import { Controller } from '@nestjs/common';
import { SessionService } from './session.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  ILogin,
  IRequestPasswordReset,
  IRequestUser,
  IResendOtp,
  IResetPassword,
  ISetPassword,
  ISignup,
  IVerifyOtp,
  IVerifyResetOtp,
  IVerifySignUpOtp,
} from '@lib/common/interfaces';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import { formatKey } from '@lib/utils/format.util';
import { ELanguage, EUserRole } from '@lib/common/enums';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly awsClientService: AwsClientService,
  ) {}

  @MessagePattern({
    cmd: SessionController.prototype.login.name,
  })
  login(data: ILogin) {
    return this.sessionService.login(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.loginUser.name,
  })
  loginUser(data: ILogin) {
    return this.sessionService.loginUser(data);
  }

  @MessagePattern({ cmd: SessionController.prototype.googleAuthRedirect.name })
  googleAuthRedirect(data) {
    return this.sessionService.googleAuthRedirect(data);
  }

  @MessagePattern({ cmd: SessionController.prototype.socialCallback.name })
  socialCallback(data) {
    return this.sessionService.socialCallback(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.verifyOtp.name,
  })
  verifyOtp(data: IVerifyOtp) {
    return this.sessionService.verifyOtp(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.registerEmail.name,
  })
  async registerEmail(email: string) {
    return await this.sessionService.registerEmail(email);
  }

  @MessagePattern({
    cmd: SessionController.prototype.verifySignupOtp.name,
  })
  async verifySignupOtp(data: IVerifySignUpOtp) {
    return await this.sessionService.verifySignupOtp(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.resendOtp.name,
  })
  async resendOtp(data: IResendOtp) {
    return await this.sessionService.resendOtp(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.setPassword.name,
  })
  async setPassword(data: ISetPassword) {
    return await this.sessionService.setPassword(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.signup.name,
  })
  async signup({
    data,
    app,
    reqUser,
    lang,
  }: {
    data: ISignup;
    app: EUserRole;
    reqUser: IRequestUser;
    lang: ELanguage;
  }) {
    data.userImages = await Promise.all(
      data.userImages?.map(async (image, index) => {
        const key = formatKey(reqUser, image.key);
        const url = await this.awsClientService.createS3PresignedUrl(key);
        return { ...image, url, order: index };
      }),
    );
    data.id = reqUser.userId;

    return await this.sessionService.signup(data, lang);
  }

  @MessagePattern({
    cmd: SessionController.prototype.getUserSession.name,
  })
  getUserSession(data) {
    return this.sessionService.getUserSession(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.refreshToken.name,
  })
  refreshToken(data) {
    return this.sessionService.refreshToken(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.logout.name,
  })
  logout(data) {
    return this.sessionService.logout(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.forgotPassword.name,
  })
  forgotPassword(data: IRequestPasswordReset) {
    return this.sessionService.forgotPassword(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.verifyOtpForgotPassword.name,
  })
  verifyOtpForgotPassword(data: IVerifyResetOtp) {
    return this.sessionService.verifyOtpForgotPassword(data);
  }

  @MessagePattern({
    cmd: SessionController.prototype.resetPassword.name,
  })
  resetPassword(data: IResetPassword) {
    return this.sessionService.resetPassword(data);
  }
}
