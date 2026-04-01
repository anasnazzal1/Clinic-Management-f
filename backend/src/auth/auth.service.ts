import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user._id, username: user.username, role: user.role, linkedId: user.linkedId, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user._id, username: user.username, role: user.role, name: user.name, email: user.email, linkedId: user.linkedId, profileImage: user.profileImage },
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException();
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect.');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Password updated successfully.' };
  }

  async register(dto: { username: string; password: string; role: string; name: string; email: string; linkedId?: string }) {
    const exists = await this.userModel.findOne({ username: dto.username });
    if (exists) throw new ConflictException('Username already exists');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({ ...dto, password: hashed });
    return { id: user._id, username: user.username, role: user.role, name: user.name, email: user.email };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new UnauthorizedException();
    return { id: user._id, username: user.username, role: user.role, name: user.name, email: user.email, linkedId: user.linkedId, profileImage: user.profileImage };
  }
}
