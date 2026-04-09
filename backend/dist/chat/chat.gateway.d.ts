import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.schema';
import { Model } from 'mongoose';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly jwtService;
    private userModel;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService, jwtService: JwtService, userModel: Model<User>);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleMessage(sendMessageDto: SendMessageDto, client: Socket): Promise<{
        success: boolean;
        message: import("./message.schema").Message;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    } | undefined>;
    handleJoinConversation(data: {
        conversationId: string;
    }, client: Socket): {
        success: boolean;
    };
    handleLeaveConversation(data: {
        conversationId: string;
    }, client: Socket): {
        success: boolean;
    };
}
