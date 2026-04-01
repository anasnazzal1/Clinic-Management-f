import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true }) username: string;
  @Prop({ required: true }) password: string;
  @Prop({ required: true, enum: ['admin', 'doctor', 'receptionist', 'patient'] }) role: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop() linkedId?: string;
  @Prop() profileImage?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
