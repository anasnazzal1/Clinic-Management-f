import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Doctor extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) specialization: string;
  @Prop() phone: string;
  @Prop() email: string;
  @Prop({ type: Types.ObjectId, ref: 'Clinic' }) clinicId: Types.ObjectId;
  @Prop() workingDays: string;
  @Prop() workingHours: string;
  @Prop() avatar?: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
