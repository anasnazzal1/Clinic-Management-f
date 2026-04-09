import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationSchema } from './conversation.schema';
import { Message, MessageSchema } from './message.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Appointment } from '../appointments/appointment.schema';
import { User } from '../users/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createOrGetConversation(createConversationDto: CreateConversationDto, userId: string, userRole: string): Promise<Conversation> {
    const { doctorId, patientId } = createConversationDto;

    // Validate that the user is either the doctor or the patient
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let isAuthorized = false;
    if (userRole === 'doctor' && user.linkedId === doctorId) {
      isAuthorized = true;
    } else if (userRole === 'patient' && user.linkedId === patientId) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new ForbiddenException('Access denied');
    }

    // Check if appointment exists between doctor and patient
    const appointmentExists = await this.appointmentModel.findOne({
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(patientId),
      status: { $ne: 'cancelled' } // Allow if not cancelled
    });

    if (!appointmentExists) {
      throw new ForbiddenException('No appointment found between this doctor and patient');
    }

    // Check if conversation already exists
    let conversation = await this.conversationModel.findOne({
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(patientId),
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        doctorId: new Types.ObjectId(doctorId),
        patientId: new Types.ObjectId(patientId),
      });
      await conversation.save();
    }

    return conversation;
  }

  async getConversations(userId: string, userRole: string): Promise<Conversation[]> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let filter = {};
    if (userRole === 'doctor') {
      filter = { doctorId: new Types.ObjectId(user.linkedId) };
    } else if (userRole === 'patient') {
      filter = { patientId: new Types.ObjectId(user.linkedId) };
    } else {
      throw new ForbiddenException('Access denied');
    }

    return this.conversationModel.find(filter)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });
  }

  async getMessages(conversationId: string, userId: string, userRole: string): Promise<Message[]> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Check if user is part of this conversation
    let isAuthorized = false;
    if (userRole === 'doctor' && conversation.doctorId.toString() === user.linkedId) {
      isAuthorized = true;
    } else if (userRole === 'patient' && conversation.patientId.toString() === user.linkedId) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new ForbiddenException('Access denied');
    }

    return this.messageModel.find({ conversationId: new Types.ObjectId(conversationId) })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });
  }

  async sendMessage(sendMessageDto: SendMessageDto, userId: string, userRole: string): Promise<Message> {
    const { conversationId, message } = sendMessageDto;

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Check if user is part of this conversation
    let isAuthorized = false;
    if (userRole === 'doctor' && conversation.doctorId.toString() === user.linkedId) {
      isAuthorized = true;
    } else if (userRole === 'patient' && conversation.patientId.toString() === user.linkedId) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new ForbiddenException('Access denied');
    }

    const newMessage = new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(userId),
      message,
    });

    return newMessage.save();
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Mark all messages in conversation as read, except those sent by the user
    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        senderId: { $ne: new Types.ObjectId(userId) },
        read: false
      },
      { read: true }
    );
  }

  async getUnreadCount(userId: string, userRole: string): Promise<number> {
    const user = await this.userModel.findById(userId);
    if (!user) return 0;

    let conversations: any[] = [];
    if (userRole === 'doctor') {
      conversations = await this.conversationModel.find({ doctorId: new Types.ObjectId(user.linkedId) });
    } else if (userRole === 'patient') {
      conversations = await this.conversationModel.find({ patientId: new Types.ObjectId(user.linkedId) });
    }

    if (conversations.length === 0) return 0;

    const conversationIds = conversations.map(c => c._id);

    const unreadCount = await this.messageModel.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: new Types.ObjectId(userId) },
      read: false
    });

    return unreadCount;
  }
}