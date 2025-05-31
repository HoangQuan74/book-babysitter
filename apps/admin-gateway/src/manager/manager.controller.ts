import { LanguageCode, Permission } from '@lib/common/decorator';
import { EService } from '@lib/common/enums';
import { MessageBuilder } from '@lib/core/message-builder';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateManagerDto, QueryManagerDto, UpdateManagerDto } from './dto';
import { PermissionGuard } from '@lib/utils/guards';

@ApiBearerAuth()
@ApiTags('Manager')
@Controller('manager')
export class ManagerController {
  constructor(private readonly messageBuilder: MessageBuilder) {}

  @UseGuards(PermissionGuard)
  @Permission(ManagerController.prototype.createManager.name)
  @Post('/')
  async createManager(@Body() createManager: CreateManagerDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, createManager, {
      cmd: ManagerController.prototype.createManager.name,
    });
  }

  @UseGuards(PermissionGuard)
  @Permission(ManagerController.prototype.updateManager.name)
  @Patch('/')
  async updateManager(@Body() updateManager: UpdateManagerDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, updateManager, {
      cmd: ManagerController.prototype.updateManager.name,
    });
  }

  @UseGuards(PermissionGuard)
  @Permission(ManagerController.prototype.getManagers.name)
  @Get('/')
  async getManagers(@Query() query: QueryManagerDto) {
    return await this.messageBuilder.sendMessage(EService.AUTH, query, {
      cmd: ManagerController.prototype.getManagers.name,
    });
  }

  @ApiSecurity('X-LANG-CODE')
  @Get(':id')
  async getManagerById(@Param('id') id: string, @LanguageCode() lang: string) {
    return await this.messageBuilder.sendMessage(
      EService.AUTH,
      { id, lang },
      {
        cmd: ManagerController.prototype.getManagerById.name,
      },
    );
  }

  @UseGuards(PermissionGuard)
  @Permission(ManagerController.prototype.deleteManagerById.name)
  @Delete(':id')
  async deleteManagerById(@Param('id') managerId: string) {
    return await this.messageBuilder.sendMessage(EService.AUTH, managerId, {
      cmd: ManagerController.prototype.deleteManagerById.name,
    });
  }
}
