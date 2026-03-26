import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clinic } from './clinic.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsOptional } from 'class-validator';

class ClinicDto {
  @IsString() name: string;
  @IsOptional() @IsString() workingHours?: string;
  @IsOptional() @IsString() workingDays?: string;
}

@Controller('clinics')
export class ClinicsController {
  constructor(@InjectModel(Clinic.name) private model: Model<Clinic>) {}

  @Get()
  findAll(@Query('search') search?: string) {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    return this.model.find(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.model.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  create(@Body() dto: ClinicDto) {
    return this.model.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: Partial<ClinicDto>) {
    return this.model.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
