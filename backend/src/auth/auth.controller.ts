import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { IsString, IsEmail, IsIn, IsOptional, MinLength, Matches } from 'class-validator';

class LoginDto {
  @IsString() username: string;
  @IsString() password: string;
}

class RegisterDto {
  @IsString()
  @MinLength(4, { message: 'Username must be at least 4 characters.' })
  @Matches(/^\S+$/, { message: 'Username must not contain spaces.' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/, { message: 'Password must contain at least 1 letter and 1 number.' })
  password: string;

  @IsIn(['admin', 'doctor', 'receptionist', 'patient']) role: string;
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() linkedId?: string;
}

class ChangePasswordDto {
  @IsString() currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/, { message: 'New password must contain at least 1 letter and 1 number.' })
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(@Body() dto: ChangePasswordDto, @Request() req: any) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @Post('register')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'receptionist')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
