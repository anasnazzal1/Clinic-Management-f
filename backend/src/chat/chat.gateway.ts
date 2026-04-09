import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:8080',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async handleConnection(client: Socket) {
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
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries()).find(([_, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      if (!user) return;

      const message = await this.chatService.sendMessage(sendMessageDto, user._id.toString(), user.role);

      // Populate the message for sending
      const populatedMessage = await this.chatService.getMessages(sendMessageDto.conversationId, user._id.toString(), user.role);
      const latestMessage = populatedMessage[populatedMessage.length - 1];

      // Send to all participants in the conversation
      const conversation = await this.chatService.getConversations(user._id.toString(), user.role);
      const currentConversation = conversation.find(c => c._id.toString() === sendMessageDto.conversationId);

      if (currentConversation) {
        const participants = [currentConversation.doctorId, currentConversation.patientId];

        // Find connected sockets for participants
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
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    return { success: true };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.conversationId);
    return { success: true };
  }
}