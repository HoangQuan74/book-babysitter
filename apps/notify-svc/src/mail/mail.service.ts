import { BaseRepository } from '@lib/core/repository/base.service';
import { Injectable } from '@nestjs/common';
import * as pug from 'pug';
import { IMailSender } from '@lib/common/interfaces';
import * as mailer from 'nodemailer';
import { SES } from '@aws-sdk/client-ses';
import { AwsClientService } from '@lib/utils/aws-client/aws-client.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';

@Injectable()
export class MailService extends BaseRepository {
  constructor(private readonly awsClient: AwsClientService) {
    super();
  }

  async sendEmail(data: IMailSender) {
    return this.awsClient.sendTemplatedEmail(data);
  }

  async creatEmailTemplate(data) {
    try {
      const template = await this.awsClient.createEmailTemplate(data);
      return template;
    } catch (error) {}
  }

  async getEmailTemplate() {
    try {
      const template = await this.awsClient.getListTemplates();
      return template;
    } catch (error) {}
  }
  async getEmailTemplateDetail(data) {
    const { templateName } = data;
    const template = await this.awsClient.getTemplateDetail(templateName);
    return template;
  }

  async updateEmailTemplate(data) {
    const template = await this.awsClient.updateEmailTemplate(data);
    return template;
  }
}
