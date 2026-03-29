import { AuthService } from './auth.service';
declare class LoginDto {
    username: string;
    password: string;
}
declare class RegisterDto {
    username: string;
    password: string;
    role: string;
    name: string;
    email: string;
    linkedId?: string;
}
declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            username: string;
            role: string;
            name: string;
            email: string;
            linkedId: string | undefined;
        };
    }>;
    changePassword(dto: ChangePasswordDto, req: any): Promise<{
        message: string;
    }>;
    register(dto: RegisterDto): Promise<{
        id: import("mongoose").Types.ObjectId;
        username: string;
        role: string;
        name: string;
        email: string;
    }>;
}
export {};
