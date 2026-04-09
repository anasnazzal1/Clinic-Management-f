import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(createConversationDto: CreateConversationDto, req: any): Promise<import("./conversation.schema").Conversation>;
    getConversations(req: any): Promise<import("./conversation.schema").Conversation[]>;
    getMessages(conversationId: string, req: any): Promise<import("./message.schema").Message[]>;
    sendMessage(sendMessageDto: SendMessageDto, req: any): Promise<import("./message.schema").Message>;
    markMessagesAsRead(conversationId: string, req: any): Promise<{
        success: boolean;
    }>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
}
