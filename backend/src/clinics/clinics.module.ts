import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Clinic, ClinicSchema } from './clinic.schema';
import { ClinicsController } from './clinics.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Clinic.name, schema: ClinicSchema }])],
  controllers: [ClinicsController],
  exports: [MongooseModule],
})
export class ClinicsModule {}
