import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Doctor } from './doctor.schema';
import { User } from '../users/user.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsOptional } from 'class-validator';

class DoctorDto {
  @IsString() name: string;
  @IsString() specialization: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() clinicId?: string;
  @IsOptional() @IsString() workingDays?: string;
  @IsOptional() @IsString() workingHours?: string;
  @IsOptional() @IsString() avatar?: string;
}

@Controller('doctors')
export class DoctorsController {
  constructor(
    @InjectModel(Doctor.name) private model: Model<Doctor>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  @Get()
  async findAll(@Query('clinicId') clinicId?: string, @Query('search') search?: string) {
    const filter: any = {};
    if (clinicId) {
      // Handle clinicId stored as ObjectId or plain string in legacy data.
      if (Types.ObjectId.isValid(clinicId)) {
        filter.clinicId = { $in: [clinicId, new Types.ObjectId(clinicId)] };
      } else {
        // Invalid/empty clinicId should not force empty result sets.
        filter.clinicId = { $ne: null };
      }
    }
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
    ];
    const doctors = await this.model.find(filter).populate('clinicId', 'name').lean();
    const doctorIds = doctors.map(d => d._id.toString());
    const linkedUsers = await this.userModel
      .find({ role: 'doctor', linkedId: { $in: doctorIds } })
      .select('linkedId profileImage')
      .lean();

    const imageByLinkedId = new Map(linkedUsers.map(u => [u.linkedId, u.profileImage]));
    return doctors.map((doctor: any) => ({
      ...doctor,
      profileImage: doctor.avatar || imageByLinkedId.get(doctor._id.toString()) || null,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const doctor: any = await this.model.findById(id).populate('clinicId', 'name').lean();
    if (!doctor) return null;

    const linkedUser: any = await this.userModel
      .findOne({ role: 'doctor', linkedId: doctor._id.toString() })
      .select('profileImage')
      .lean();

    return {
      ...doctor,
      profileImage: doctor.avatar || linkedUser?.profileImage || null,
    };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  create(@Body() dto: DoctorDto) {
    return this.model.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: Partial<DoctorDto>) {
    return this.model.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
