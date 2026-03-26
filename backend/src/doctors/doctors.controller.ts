import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor } from './doctor.schema';
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
  constructor(@InjectModel(Doctor.name) private model: Model<Doctor>) {}

  @Get()
  findAll(@Query('clinicId') clinicId?: string, @Query('search') search?: string) {
    const filter: any = {};
    if (clinicId) filter.clinicId = clinicId;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
    ];
    return this.model.find(filter).populate('clinicId', 'name');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.model.findById(id).populate('clinicId', 'name');
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
