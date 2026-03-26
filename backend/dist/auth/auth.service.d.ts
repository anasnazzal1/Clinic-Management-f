import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<User>, jwtService: JwtService);
    login(username: string, password: string): Promise<{
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
    register(dto: {
        username: string;
        password: string;
        role: string;
        name: string;
        email: string;
        linkedId?: string;
    }): Promise<{
        id: import("mongoose").Types.ObjectId;
        username: string;
        role: string;
        name: string;
        email: string;
    }>;
}
