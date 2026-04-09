import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true }) doctorId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true }) patientId: Types.ObjectId;
  @Prop({ type: Date, default: Date.now }) createdAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);