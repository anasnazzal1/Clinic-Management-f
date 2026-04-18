import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { Patient, PatientSchema } from '../patients/patient.schema';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  controllers: [AppointmentsController],
  exports: [MongooseModule],
})
export class AppointmentsModule {}
