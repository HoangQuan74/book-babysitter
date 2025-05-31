import { Prop, Schema } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
@Schema()
export class BaseSchema {
  @Prop({ type: String, default: () => randomUUID() })
  id: string;

  @Prop({ default: () => new Date() })
  createdAt?: Date;

  @Prop({ default: () => new Date() })
  updatedAt?: Date;

  @Prop({ required: false, default: null })
  deletedAt?: Date;
}
