import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { MessagePattern } from '@nestjs/microservices';
import { Public } from '@lib/common/decorator';

@Public()
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @MessagePattern({
    cmd: MailController.prototype.createEmailTemplate.name,
  })
  createEmailTemplate(data) {
    return this.mailService.creatEmailTemplate(data);
  }

  @MessagePattern({
    cmd: MailController.prototype.getEmailTemplate.name,
  })
  getEmailTemplate() {
    return this.mailService.getEmailTemplate();
  }

  @MessagePattern({
    cmd: MailController.prototype.getEmailTemplateDetail.name,
  })
  getEmailTemplateDetail(data) {
    return this.mailService.getEmailTemplateDetail(data);
  }

  @MessagePattern({
    cmd: MailController.prototype.sendEmail.name,
  })
  sendEmail(data) {
    return this.mailService.sendEmail(data);
  }

  @MessagePattern({
    cmd: MailController.prototype.updateEmailTemplate.name,
  })
  updateEmailTemplate(data) {
    return this.mailService.updateEmailTemplate(data);
  }
}
