import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';

export class EmailTemplate extends BaseSchema {
  @Prop()
  name: string;

  @Prop()
  subject: string;

  @Prop()
  text: string;

  @Prop()
  html: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
