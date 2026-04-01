import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Patient extends Document {
  @Prop({ required: true }) name: string;
  @Prop() age: number;
  @Prop() gender: string;
  @Prop() phone: string;
  @Prop() email: string;
  @Prop() address: string;
  @Prop() profileImage?: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
