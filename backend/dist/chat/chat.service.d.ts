import { Model } from 'mongoose';
import { Conversation } from './conversation.schema';
import { Message } from './message.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Appointment } from '../appointments/appointment.schema';
import { User } from '../users/user.schema';
export declare class ChatService {
    private conversationModel;
    private messageModel;
    private appointmentModel;
    private userModel;
    constructor(conversationModel: Model<Conversation>, messageModel: Model<Message>, appointmentModel: Model<Appointment>, userModel: Model<User>);
    createOrGetConversation(createConversationDto: CreateConversationDto, userId: string, userRole: string): Promise<Conversation>;
    getConversations(userId: string, userRole: string): Promise<Conversation[]>;
    getMessages(conversationId: string, userId: string, userRole: string): Promise<Message[]>;
    sendMessage(sendMessageDto: SendMessageDto, userId: string, userRole: string): Promise<Message>;
    markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string, userRole: string): Promise<number>;
}
