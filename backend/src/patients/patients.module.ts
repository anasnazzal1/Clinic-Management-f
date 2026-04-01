import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './patient.schema';
import { User, UserSchema } from '../users/user.schema';
import { PatientsController } from './patients.controller';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Patient.name, schema: PatientSchema },
    { name: User.name, schema: UserSchema },
  ])],
  controllers: [PatientsController],
  exports: [MongooseModule],
})
export class PatientsModule {}
