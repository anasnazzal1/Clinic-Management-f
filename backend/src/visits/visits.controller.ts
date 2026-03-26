import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Visit } from './visit.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsOptional } from 'class-validator';

class CreateVisitDto {
  @IsString() appointmentId: string;
  @IsString() patientId: string;
  @IsString() doctorId: string;
  @IsString() date: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() diagnosis?: string;
}

@Controller('visits')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VisitsController {
  constructor(@InjectModel(Visit.name) private model: Model<Visit>) {}

  @Get()
  @Roles('admin', 'doctor', 'patient')
  findAll(@Query('patientId') patientId?: string, @Query('doctorId') doctorId?: string, @Request() req?: any) {
    const filter: any = {};
    if (patientId) filter.patientId = patientId;
    if (doctorId) filter.doctorId = doctorId;
    if (req.user.role === 'doctor') filter.doctorId = req.user.linkedId;
    if (req.user.role === 'patient') filter.patientId = req.user.linkedId;
    return this.model.find(filter)
      .populate('patientId', 'name')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'patient')
  findOne(@Param('id') id: string) {
    return this.model.findById(id).populate('patientId', 'name').populate('doctorId', 'name');
  }

  @Post()
  @Roles('doctor')
  create(@Body() dto: CreateVisitDto) {
    return this.model.create(dto);
  }
}
