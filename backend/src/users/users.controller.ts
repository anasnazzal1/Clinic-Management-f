import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseGuards, Query, UseInterceptors, UploadedFile, Request, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
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

const imageStorage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
    return cb(new BadRequestException('Only JPG and PNG files are allowed.'), false);
  }
  cb(null, true);
};

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

  // ── Image upload ────────────────────────────────────────────────────────────
  @Post(':id/upload-image')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } }))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');

    // Non-admin: can only update their own linked user record
    if (req.user.role !== 'admin') {
      const existing = await this.model.findOne({ linkedId: req.user.linkedId });
      if (!existing || existing._id.toString() !== id) {
        throw new BadRequestException('You can only update your own profile image.');
      }
    }

    // Delete old image file if it exists
    const user = await this.model.findById(id);
    if (user?.profileImage) {
      const oldPath = join(process.cwd(), 'uploads', user.profileImage.split('/uploads/')[1] ?? '');
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }

    const imageUrl = `/uploads/${file.filename}`;
    const updated = await this.model.findByIdAndUpdate(id, { profileImage: imageUrl }, { new: true }).select('-password');
    return updated;
  }

  // ── Image delete ────────────────────────────────────────────────────────────
  @Delete(':id/image')
  async deleteImage(@Param('id') id: string) {
    const user = await this.model.findById(id);
    if (user?.profileImage) {
      const filePath = join(process.cwd(), 'uploads', user.profileImage.split('/uploads/')[1] ?? '');
      if (existsSync(filePath)) unlinkSync(filePath);
    }
    return this.model.findByIdAndUpdate(id, { $unset: { profileImage: '' } }, { new: true }).select('-password');
  }
}
