import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './patient.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class PatientDto {
  @IsString() name: string;
  @IsOptional() @Type(() => Number) @IsNumber() age?: number;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
}

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
  constructor(@InjectModel(Patient.name) private model: Model<Patient>) {}

  @Get()
  @Roles('admin', 'receptionist', 'doctor')
  findAll(@Query('search') search?: string) {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    return this.model.find(filter);
  }

  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  findOne(@Param('id') id: string, @Request() req: any) {
    if (req.user.role === 'patient' && req.user.linkedId !== id) {
      return null;
    }
    return this.model.findById(id);
  }

  @Post()
  @Roles('admin', 'receptionist')
  create(@Body() dto: PatientDto) {
    return this.model.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'receptionist')
  update(@Param('id') id: string, @Body() dto: Partial<PatientDto>) {
    return this.model.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @Roles('admin', 'receptionist')
  delete(@Param('id') id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
