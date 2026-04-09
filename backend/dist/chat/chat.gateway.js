"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const jwt_1 = require("@nestjs/jwt");
const user_schema_1 = require("../users/user.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ChatGateway = class ChatGateway {
    chatService;
    jwtService;
    userModel;
    server;
    connectedUsers = new Map();
    constructor(chatService, jwtService, userModel) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.userModel = userModel;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const user = await this.userModel.findById(payload.sub);
            if (!user) {
                client.disconnect();
                return;
            }
            client.data.user = user;
            this.connectedUsers.set(user._id.toString(), client.id);
            console.log(`User ${user.name} connected`);
        }
        catch (error) {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = Array.from(this.connectedUsers.entries()).find(([_, socketId]) => socketId === client.id)?.[0];
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`User ${userId} disconnected`);
        }
    }
    async handleMessage(sendMessageDto, client) {
        try {
            const user = client.data.user;
            if (!user)
                return;
            const message = await this.chatService.sendMessage(sendMessageDto, user._id.toString(), user.role);
            const populatedMessage = await this.chatService.getMessages(sendMessageDto.conversationId, user._id.toString(), user.role);
            const latestMessage = populatedMessage[populatedMessage.length - 1];
            const conversation = await this.chatService.getConversations(user._id.toString(), user.role);
            const currentConversation = conversation.find(c => c._id.toString() === sendMessageDto.conversationId);
            if (currentConversation) {
                const participants = [currentConversation.doctorId, currentConversation.patientId];
                for (const participant of participants) {
                    const participantUser = await this.userModel.findOne({ linkedId: participant._id.toString() });
                    if (participantUser && this.connectedUsers.has(participantUser._id.toString())) {
                        const socketId = this.connectedUsers.get(participantUser._id.toString());
                        if (socketId) {
                            this.server.to(socketId).emit('receiveMessage', latestMessage);
                        }
                    }
                }
            }
            return { success: true, message: latestMessage };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    handleJoinConversation(data, client) {
        client.join(data.conversationId);
        return { success: true };
    }
    handleLeaveConversation(data, client) {
        client.leave(data.conversationId);
        return { success: true };
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveConversation", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:8080',
            credentials: true,
        },
    }),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        mongoose_2.Model])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map