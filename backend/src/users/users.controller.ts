import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsEmail, IsIn, IsOptional } from 'class-validator';

class UserDto {
  @IsString() username: string;
  @IsString() password: string;
  @IsIn(['admin', 'doctor', 'receptionist', 'patient']) role: string;
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() linkedId?: string;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  @Get()
  findAll(@Query('role') role?: string) {
    const filter = role ? { role } : {};
    return this.model.find(filter).select('-password');
  }

  @Get('by-linked/:linkedId')
  findByLinkedId(@Param('linkedId') linkedId: string) {
    return this.model.findOne({ linkedId }).select('-password');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.model.findById(id).select('-password');
  }

  @Post()
  async create(@Body() dto: UserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.model.create({ ...dto, password: hashed });
    const { password, ...result } = user.toObject();
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<UserDto>) {
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    return this.model.findByIdAndUpdate(id, dto, { new: true }).select('-password');
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
