import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  CreateTemplateCommand,
  GetTemplateCommand,
  ListTemplatesCommand,
  SendTemplatedEmailCommand,
  SESClient,
  UpdateTemplateCommand,
} from '@aws-sdk/client-ses';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IMailSender,
  IMailTemplate,
  IRequestUser,
} from '@lib/common/interfaces';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatKey } from '..';

@Injectable()
export class AwsClientService {
  constructor(private readonly configService: ConfigService) {}

  createS3PresignedUrl(key: string) {
    const { region, bucket, credentials } = this.configService.get('aws.s3');
    const client = new S3Client({
      region,
      credentials,
    });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
  }

  async createS3PresignedUrlList(
    reqUser: IRequestUser,
    keys: string[],
  ): Promise<{ url: string; urlPresigned: string }[]> {
    const results = await Promise.all(
      keys.map(async (key) => {
        const urlPresigned = await this.createS3PresignedUrl(
          formatKey(reqUser, key),
        );
        const url = urlPresigned.split('?')[0];
        return { url, urlPresigned };
      }),
    );

    return results;
  }

  async createEmailTemplate(data: IMailTemplate) {
    const { region, credentials } = this.configService.get('aws.ses');
    const client = new SESClient({
      region,
      credentials,
    });
    const command = new CreateTemplateCommand({
      Template: {
        TemplateName: data.name,
        SubjectPart: data.subject,
        TextPart: data.text,
        HtmlPart: data.html,
      },
    });
    const response = await client.send(command);
    return response;
  }

  async getListTemplates() {
    const { region, credentials } = this.configService.get('aws.ses');
    const client = new SESClient({
      region,
      credentials,
    });

    const command = new ListTemplatesCommand();
    const response = await client.send(command);
    return response.TemplatesMetadata;
  }
  async getTemplateDetail(templateName: string) {
    const { region, credentials } = this.configService.get('aws.ses');
    const client = new SESClient({
      region,
      credentials,
    });

    const command = new GetTemplateCommand({ TemplateName: templateName });
    const response = await client.send(command);
    return response.Template;
  }

  async sendTemplatedEmail(data: IMailSender) {
    const { region, credentials, sender } = this.configService.get('aws.ses');
    const client = new SESClient({
      region,
      credentials,
    });
    const command = new SendTemplatedEmailCommand({
      Source: sender,
      Destination: {
        ToAddresses: data.receivers,
      },
      Tags: [
        {
          Name: data.name,
          Value: data.name,
        },
      ],
      Template: data.name,
      TemplateData: JSON.stringify(data.params),
    });
    const response = await client.send(command);
    return response;
  }

  async updateEmailTemplate(data) {
    const { templateName, html, subject, text } = data;
    const { region, credentials, sender } = this.configService.get('aws.ses');
    const client = new SESClient({
      region,
      credentials,
    });
    const command = new UpdateTemplateCommand({
      Template: {
        TemplateName: templateName,
        HtmlPart: html,
        SubjectPart: subject || 'gtrip',
        TextPart: text || '',
      },
    });
    const response = await client.send(command);
    return response;
  }
}
