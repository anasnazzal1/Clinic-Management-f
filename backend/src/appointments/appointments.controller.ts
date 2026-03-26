import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './appointment.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsOptional, IsIn } from 'class-validator';

class CreateAppointmentDto {
  @IsString() patientId: string;
  @IsString() doctorId: string;
  @IsString() clinicId: string;
  @IsString() date: string;
  @IsString() time: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() diagnosis?: string;
}

class UpdateAppointmentDto {
  @IsOptional() @IsString() patientId?: string;
  @IsOptional() @IsString() doctorId?: string;
  @IsOptional() @IsString() clinicId?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() time?: string;
  @IsOptional() @IsIn(['pending', 'completed', 'cancelled', 'deleted']) status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() diagnosis?: string;
}

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppointmentsController {
  constructor(@InjectModel(Appointment.name) private model: Model<Appointment>) {}

  @Get()
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  findAll(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    const filter: any = {};
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    // Non-admin roles: scope to own data and hide deleted
    if (req.user.role === 'doctor') { filter.doctorId = req.user.linkedId; filter.status = { $ne: 'deleted' }; }
    if (req.user.role === 'patient') { filter.patientId = req.user.linkedId; filter.status = { $ne: 'deleted' }; }
    if (req.user.role === 'receptionist') filter.status = { $ne: 'deleted' };
    return this.model.find(filter)
      .populate('patientId', 'name')
      .populate('doctorId', 'name specialization')
      .populate('clinicId', 'name')
      .sort({ date: -1 });
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  findOne(@Param('id') id: string) {
    return this.model.findById(id)
      .populate('patientId', 'name')
      .populate('doctorId', 'name specialization')
      .populate('clinicId', 'name');
  }

  @Post()
  @Roles('admin', 'receptionist')
  create(@Body() dto: CreateAppointmentDto) {
    return this.model.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'doctor', 'receptionist')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.model.findByIdAndUpdate(id, dto, { new: true })
      .populate('patientId', 'name')
      .populate('doctorId', 'name specialization')
      .populate('clinicId', 'name');
  }

  // Soft delete — sets status to 'deleted', admin only
  @Delete(':id')
  @Roles('admin')
  softDelete(@Param('id') id: string) {
    return this.model.findByIdAndUpdate(id, { status: 'deleted' }, { new: true });
  }
}
