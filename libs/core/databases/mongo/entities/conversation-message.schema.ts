import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { Date } from 'mongoose';
@Schema({
  collection: 'conversation_messsage',
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
export class ConversationMessage extends BaseSchema {
  @Prop({ type: String })
  conversationId: string;

  @Prop({ type: String })
  from: string;

  @Prop({ type: String })
  to: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: Array })
  files: string[];

  @Prop({ type: Boolean, default: false })
  isSeen: boolean;

  @Prop({ type: Date, default: null })
  seenAt: Date;
}
export const ConversationMessageSchema =
  SchemaFactory.createForClass(ConversationMessage);
