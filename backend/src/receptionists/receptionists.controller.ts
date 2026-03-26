import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receptionist } from './receptionist.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsOptional } from 'class-validator';

class ReceptionistDto {
  @IsString() name: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
}

@Controller('receptionists')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReceptionistsController {
  constructor(@InjectModel(Receptionist.name) private model: Model<Receptionist>) {}

  @Get()
  @Roles('admin')
  findAll(@Query('search') search?: string) {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    return this.model.find(filter);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.model.findById(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: ReceptionistDto) {
    return this.model.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: Partial<ReceptionistDto>) {
    return this.model.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
