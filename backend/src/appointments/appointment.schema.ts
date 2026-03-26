import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true }) patientId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true }) doctorId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Clinic', required: true }) clinicId: Types.ObjectId;
  @Prop({ required: true }) date: string;
  @Prop({ required: true }) time: string;
  @Prop({ default: 'pending', enum: ['pending', 'completed', 'cancelled', 'deleted'] }) status: string;
  @Prop() notes?: string;
  @Prop() diagnosis?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
