import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MessageBuilder } from '@lib/core/message-builder';
import { EOtpType, EService } from '@lib/common/enums';
import {
  LoginDto,
  RefreshTokenDto,
  RequestPasswordResetDto,
  ResendOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
  VerifyResetOtpDto,
} from './dto';
import { LanguageCode, Public, RequestUser } from '@lib/common/decorator';

@ApiBearerAuth()
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    console.log('🚀 ~ AuthController ~ login ~ body:', body);
    return this.messageBuilder.sendMessage(EService.AUTH, body, {
      cmd: AuthController.prototype.login.name,
    });
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: RequestPasswordResetDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, body, {
      cmd: AuthController.prototype.forgotPassword.name,
    });
  }

  @Public()
  @Post('forgot-password/otp')
  async verifyOtpForgotPassword(@Body() body: VerifyResetOtpDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, body, {
      cmd: AuthController.prototype.verifyOtpForgotPassword.name,
    });
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, body, {
      cmd: AuthController.prototype.resetPassword.name,
    });
  }
  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.messageBuilder.sendMessage(EService.AUTH, body, {
      cmd: AuthController.prototype.verifyOtp.name,
    });
  }
  @ApiSecurity('X-LANG-CODE')
  @Get('profile')
  getProfile(@RequestUser() reqUser, @LanguageCode() langCode: string) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser, langCode },
      {
        cmd: AuthController.prototype.getProfile.name,
      },
    );
  }

  @Public()
  @Post('refresh')
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.messageBuilder.sendMessage(EService.AUTH, body, {
      cmd: AuthController.prototype.refreshToken.name,
    });
  }

  @Post('logout')
  logout(@RequestUser() user, @Body() body: RefreshTokenDto) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { user, body },
      {
        cmd: AuthController.prototype.logout.name,
      },
    );
  }

  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() data: ResendOtpDto) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { email: data.email, type: EOtpType.ADMIN_LOGIN },
      {
        cmd: AuthController.prototype.resendOtp.name,
      },
    );
  }
}
