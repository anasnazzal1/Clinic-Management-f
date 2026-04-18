import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, BadRequestException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from './appointment.schema';
import { Patient } from '../patients/patient.schema';
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
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(
    @InjectModel(Appointment.name) private model: Model<Appointment>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
  ) {}

  @Get()
  @Roles('admin', 'doctor', 'receptionist', 'patient')
  async findAll(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    if (doctorId && !Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('Invalid doctorId query parameter.');
    }
    if (patientId && !Types.ObjectId.isValid(patientId)) {
      throw new BadRequestException('Invalid patientId query parameter.');
    }
    const filter: any = {};
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    // Guard against legacy/bad records with invalid refs that can crash populate.
    // Keep this loose enough to work with existing data that may not be strictly typed.
    filter.clinicId = { $nin: ['', null] };
    if (!doctorId) filter.doctorId = { $nin: ['', null] };
    if (!patientId) filter.patientId = { $nin: ['', null] };
    // Non-admin roles: scope to own data and hide deleted
    if (req.user.role === 'doctor') {
      filter.doctorId = req.user.linkedId;
      filter.status = { $ne: 'deleted' };
    }
    if (req.user.role === 'patient') {
      // Primary path: use linkedId. Fallback for legacy patient users missing linkedId.
      let patientLinkedId = req.user.linkedId;
      if (!patientLinkedId && req.user.email) {
        const patient = await this.patientModel.findOne({ email: req.user.email.toLowerCase() }).select('_id');
        patientLinkedId = patient?._id?.toString();
      }
      if (!patientLinkedId) return [];
      filter.patientId = patientLinkedId;
      filter.status = { $ne: 'deleted' };
    }
    if (req.user.role === 'receptionist') filter.status = { $ne: 'deleted' };
    try {
      const data = await this.model.find(filter)
        .populate('patientId', 'name')
        .populate('doctorId', 'name specialization')
        .populate('clinicId', 'name')
        .sort({ date: -1 });
      return data;
    } catch (error: any) {
      this.logger.error(`Failed loading appointments for role=${req?.user?.role}: ${error?.message}`);
      throw error;
    }
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
  @Roles('admin', 'receptionist', 'doctor')
  create(@Body() dto: CreateAppointmentDto, @Request() req: any) {
    // Doctors can only book appointments for themselves
    if (req.user.role === 'doctor') {
      dto.doctorId = req.user.linkedId;
    }
    if (!Types.ObjectId.isValid(dto.patientId) || !Types.ObjectId.isValid(dto.doctorId) || !Types.ObjectId.isValid(dto.clinicId)) {
      throw new BadRequestException('Invalid patient, doctor, or clinic ID.');
    }
    return this.model.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'doctor', 'receptionist')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    if (dto.patientId && !Types.ObjectId.isValid(dto.patientId)) {
      throw new BadRequestException('Invalid patient ID.');
    }
    if (dto.doctorId && !Types.ObjectId.isValid(dto.doctorId)) {
      throw new BadRequestException('Invalid doctor ID.');
    }
    if (dto.clinicId && !Types.ObjectId.isValid(dto.clinicId)) {
      throw new BadRequestException('Invalid clinic ID.');
    }
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
