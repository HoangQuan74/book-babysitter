import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessageBuilder } from '@lib/core/message-builder/message-builder.service';
import { ELanguage, EService, EUserRole } from '@lib/common/enums';
import { SignUpDto } from './dto/signup.dto';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import {
  AppName,
  LanguageCode,
  Public,
  RequestUser,
} from '@lib/common/decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
  VerifyResetOtpDto,
  SetPasswordDto,
  ResendOtpDto,
} from './dto';
import { IRequestUser } from '@lib/common/interfaces';
import { GoogleGuard } from '@lib/utils/guards';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { SocialCallbackDto } from './dto/social.dto';

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @Public()
  @ApiSecurity('X-APP-NAME')
  @Post('login')
  loginUser(@Body() body: LoginDto, @AppName() app: EUserRole) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { ...body, app },
      {
        cmd: AuthController.prototype.loginUser.name,
      },
    );
  }

  @ApiSecurity('X-LANG-CODE')
  @Get('profile')
  getProfile(@RequestUser() reqUser, @LanguageCode() langCode: ELanguage) {
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
  logout(@RequestUser() reqUser, @Body() body: RefreshTokenDto) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { user: reqUser, body },
      {
        cmd: AuthController.prototype.logout.name,
      },
    );
  }

  @Public()
  @Post('social')
  @ApiSecurity('X-APP-NAME')
  @ApiSecurity('X-LANG-CODE')
  socialCallback(
    @Body() body: SocialCallbackDto,
    @AppName() app: EUserRole,
    @LanguageCode() lang: string,
  ) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { ...body, userRole: app, languageCode: lang },
      {
        cmd: AuthController.prototype.socialCallback.name,
      },
    );
  }

  @Public()
  @UseGuards(GoogleGuard)
  @ApiSecurity('X-APP-NAME')
  @ApiSecurity('X-LANG-CODE')
  @Get('google')
  googleAuth() {}

  @Public()
  @UseGuards(GoogleGuard)
  @Get('google/redirect')
  googleAuthRedirect(@RequestUser() reqUser) {
    return this.messageBuilder.sendMessage(EService.AUTH, reqUser, {
      cmd: AuthController.prototype.googleAuthRedirect.name,
    });
  }

  @Public()
  @Post('register-email')
  async registerEmail(@Body() { email }: RegisterEmailDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, email, {
      cmd: AuthController.prototype.registerEmail.name,
    });
  }

  @Public()
  @Post('verify-otp')
  async verifySignupOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, verifyOtpDto, {
      cmd: AuthController.prototype.verifySignupOtp.name,
    });
  }

  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() data: ResendOtpDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, data, {
      cmd: AuthController.prototype.resendOtp.name,
    });
  }

  @Public()
  @ApiSecurity('X-APP-NAME')
  @ApiSecurity('X-LANG-CODE')
  @Post('set-password')
  async setPassword(
    @Body() data: SetPasswordDto,
    @AppName() app: EUserRole,
    @LanguageCode() lang: string,
  ) {
    data.userRole = app;
    data.languageCode = lang;
    if (app == EUserRole.ADMIN || app == EUserRole.MANAGER) {
      throw new ForbiddenException();
    }
    return await this.messageBuilder.sendMessage(EService.AUTH, data, {
      cmd: AuthController.prototype.setPassword.name,
    });
  }

  @ApiSecurity('X-LANG-CODE')
  @ApiSecurity('X-APP-NAME')
  @Post('complete-signup')
  async signup(
    @RequestUser() reqUser: IRequestUser,
    @Body() data: SignUpDto,
    @AppName() app: EUserRole,
    @LanguageCode() lang: string,
  ) {
    if (data.isCompletedSignup) {
      data.completedSignup = new Date();
    }
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { data, app, reqUser, lang },
      {
        cmd: AuthController.prototype.signup.name,
      },
    );
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: RequestPasswordResetDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, body, {
      cmd: AuthController.prototype.forgotPassword.name,
    });
  }

  @Public()
  @Post('verify-otp/forgot-password')
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

  @Delete('account')
  deleteAccount(@RequestUser() reqUser) {
    return this.messageBuilder.sendMessage(
      EService.AUTH,
      { reqUser },
      {
        cmd: AuthController.prototype.deleteAccount.name,
      },
    );
  }
}
