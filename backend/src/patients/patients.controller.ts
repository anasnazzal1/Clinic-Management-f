import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseGuards, Request, Query, UseInterceptors, UploadedFile,
  HttpCode, HttpStatus, BadRequestException, ConflictException, Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Patient } from './patient.schema';
import { User } from '../users/user.schema';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

const imageStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = join(process.cwd(), 'uploads');
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
    return cb(new BadRequestException('Only JPG and PNG images are allowed.'), false);
  }
  cb(null, true);
};

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
  private readonly logger = new Logger(PatientsController.name);

  constructor(
    @InjectModel(Patient.name) private model: Model<Patient>,
    @InjectModel(User.name)    private userModel: Model<User>,
  ) {}

  // ── GET all ──────────────────────────────────────────────────────────────────
  @Get()
  @Roles('admin', 'receptionist', 'doctor')
  findAll(@Query('search') search?: string) {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    return this.model.find(filter);
  }

  // ── GET one ──────────────────────────────────────────────────────────────────
  @Get(':id')
  @Roles('admin', 'receptionist', 'doctor', 'patient')
  findOne(@Param('id') id: string, @Request() req: any) {
    if (req.user.role === 'patient' && req.user.linkedId !== id) return null;
    return this.model.findById(id);
  }

  // ── POST — robust create with optional image + user account ──────────────────
  @Post()
  @Roles('admin', 'receptionist')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profileImage', {
    storage: imageStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  async create(
    @Body() body: Record<string, any>,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: any,
  ) {
    const requestId = `${Date.now()}`;
    this.logger.log(`[${requestId}] POST /patients — role: ${req.user?.role}`);

    // ── 1. Required field validation ──────────────────────────────────────────
    const missing: string[] = [];
    if (!body.name?.trim())    missing.push('name');
    if (!body.age)             missing.push('age');
    if (!body.gender?.trim())  missing.push('gender');
    if (!body.phone?.trim())   missing.push('phone');
    if (!body.email?.trim())   missing.push('email');
    if (!body.address?.trim()) missing.push('address');

    if (missing.length > 0) {
      this.logger.warn(`[${requestId}] Missing fields: ${missing.join(', ')}`);
      throw new BadRequestException(`Missing required fields: ${missing.join(', ')}`);
    }

    // ── 2. Gender validation ──────────────────────────────────────────────────
    if (!['Male', 'Female'].includes(body.gender)) {
      throw new BadRequestException('Gender must be "Male" or "Female".');
    }

    // ── 3. Email format validation ────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw new BadRequestException('Invalid email format.');
    }

    // ── 4. Password length validation (if provided) ───────────────────────────
    if (body.password && body.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    // ── 5. Duplicate username check ───────────────────────────────────────────
    if (body.username) {
      const existingUser = await this.userModel.findOne({ username: body.username });
      if (existingUser) {
        this.logger.warn(`[${requestId}] Duplicate username: ${body.username}`);
        throw new ConflictException('Username already exists.');
      }
    }

    // ── 6. Duplicate email check (in patients) ────────────────────────────────
    const existingPatient = await this.model.findOne({ email: body.email });
    if (existingPatient) {
      this.logger.warn(`[${requestId}] Duplicate email: ${body.email}`);
      throw new ConflictException('A patient with this email already exists.');
    }

    // ── 7. Create patient ─────────────────────────────────────────────────────
    const profileImageUrl: string | undefined = file ? `/uploads/${file.filename}` : undefined;

    const patient = await this.model.create({
      name:         body.name.trim(),
      age:          Number(body.age),
      gender:       body.gender,
      phone:        body.phone.trim(),
      email:        body.email.trim().toLowerCase(),
      address:      body.address.trim(),
      ...(profileImageUrl && { profileImage: profileImageUrl }),
    }) as any;

    this.logger.log(`[${requestId}] Patient created: ${patient._id}`);

    // ── 8. Optionally create user account ─────────────────────────────────────
    let userAccount: Record<string, any> | null = null;
    if (body.username && body.password) {
      const hashed = await bcrypt.hash(body.password, 10);
      const user = await this.userModel.create({
        username:  body.username,
        password:  hashed,
        role:      'patient',
        name:      (patient as any).name,
        email:     (patient as any).email,
        linkedId:  (patient as any)._id.toString(),
        ...(profileImageUrl && { profileImage: profileImageUrl }),
      }) as any;
      userAccount = { id: user._id, username: user.username, role: user.role };
      this.logger.log(`[${requestId}] User account created: ${user._id}`);
    }

    return { patient, user: userAccount };
  }

  // ── PUT ───────────────────────────────────────────────────────────────────────
  @Put(':id')
  @Roles('admin', 'receptionist')
  update(@Param('id') id: string, @Body() body: Partial<Record<string, any>>) {
    return this.model.findByIdAndUpdate(id, body, { new: true });
  }

  // ── DELETE ────────────────────────────────────────────────────────────────────
  @Delete(':id')
  @Roles('admin', 'receptionist')
  delete(@Param('id') id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
