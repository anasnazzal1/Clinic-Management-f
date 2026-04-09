import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req: any,
  ) {
    const { id: userId, role: userRole } = req.user;
    return this.chatService.createOrGetConversation(createConversationDto, userId, userRole);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    const { id: userId, role: userRole } = req.user;
    return this.chatService.getConversations(userId, userRole);
  }

  @Get('messages/:conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ) {
    const { id: userId, role: userRole } = req.user;
    const messages = await this.chatService.getMessages(conversationId, userId, userRole);
    // Mark messages as read when fetching
    await this.chatService.markMessagesAsRead(conversationId, userId);
    return messages;
  }

  @Post('messages')
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: any,
  ) {
    const { id: userId, role: userRole } = req.user;
    return this.chatService.sendMessage(sendMessageDto, userId, userRole);
  }

  @Patch('messages/read/:conversationId')
  async markMessagesAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ) {
    const { id: userId } = req.user;
    await this.chatService.markMessagesAsRead(conversationId, userId);
    return { success: true };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const { id: userId, role: userRole } = req.user;
    const count = await this.chatService.getUnreadCount(userId, userRole);
    return { count };
  }
}