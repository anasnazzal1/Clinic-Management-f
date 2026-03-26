import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Receptionist extends Document {
  @Prop({ required: true }) name: string;
  @Prop() phone: string;
  @Prop() email: string;
}

export const ReceptionistSchema = SchemaFactory.createForClass(Receptionist);
