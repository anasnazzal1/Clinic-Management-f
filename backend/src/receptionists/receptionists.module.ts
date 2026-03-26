import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Receptionist, ReceptionistSchema } from './receptionist.schema';
import { ReceptionistsController } from './receptionists.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Receptionist.name, schema: ReceptionistSchema }])],
  controllers: [ReceptionistsController],
  exports: [MongooseModule],
})
export class ReceptionistsModule {}
