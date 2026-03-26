import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Visit, VisitSchema } from './visit.schema';
import { VisitsController } from './visits.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }])],
  controllers: [VisitsController],
  exports: [MongooseModule],
})
export class VisitsModule {}
