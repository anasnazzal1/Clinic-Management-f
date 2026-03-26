import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Clinic extends Document {
  @Prop({ required: true }) name: string;
  @Prop() workingHours: string;
  @Prop() workingDays: string;
}

export const ClinicSchema = SchemaFactory.createForClass(Clinic);
