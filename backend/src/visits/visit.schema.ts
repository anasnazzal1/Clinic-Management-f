import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Visit extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Appointment', required: true }) appointmentId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true }) patientId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true }) doctorId: Types.ObjectId;
  @Prop({ required: true }) date: string;
  @Prop() notes: string;
  @Prop() diagnosis: string;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
