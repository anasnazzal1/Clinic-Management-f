import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true }) conversationId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) senderId: Types.ObjectId;
  @Prop({ required: true }) message: string;
  @Prop({ type: Date, default: Date.now }) createdAt: Date;
  @Prop({ default: false }) read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);