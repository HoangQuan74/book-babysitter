import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';

@Schema({
  collection: 'batch_config',
  versionKey: false,
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  toJSON: {
    transform: function (_, ret) {
      delete ret._id;
    },
  },
})
export class BatchConfig extends BaseSchema {
  @Prop({ type: Number })
  duration: number;
}

export const BatchConfigSchema = SchemaFactory.createForClass(BatchConfig);
