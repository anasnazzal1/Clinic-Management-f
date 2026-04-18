import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  private normalizeId(value: unknown): string {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object' && value !== null) {
      const candidate = (value as any)._id ?? (value as any).id;
      if (candidate) return String(candidate).trim();
    }
    return String(value).trim();
  }

  private buildIdCandidates(value: string): any[] {
    const normalized = this.normalizeId(value);
    if (!normalized) return [];
    const candidates: any[] = [normalized];
    if (Types.ObjectId.isValid(normalized)) {
      candidates.push(new Types.ObjectId(normalized));
    }
    return candidates;
  }

  async createOrGetConversation(createConversationDto: CreateConversationDto, userId: string, userRole: string): Promise<Conversation> {
    const doctorId = this.normalizeId(createConversationDto.doctorId);
    const patientId = this.normalizeId(createConversationDto.patientId);

    // Validate that the user is either the doctor or the patient
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let isAuthorized = false;
    if (userRole === 'doctor' && this.normalizeId(user.linkedId) === doctorId) {
      isAuthorized = true;
    } else if (userRole === 'patient' && this.normalizeId(user.linkedId) === patientId) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      throw new ForbiddenException('Access denied');
    }

    // Check if appointment exists between doctor and patient
    const doctorIdCandidates = this.buildIdCandidates(doctorId);
    const patientIdCandidates = this.buildIdCandidates(patientId);
    this.logger.log(`createConversation lookup doctorId=${doctorId} patientId=${patientId} role=${userRole} userId=${userId}`);

    const appointmentExists = await this.appointmentModel.findOne({
      status: { $nin: ['cancelled', 'deleted'] },
      $and: [
        {
          $or: [
            { doctorId: { $in: doctorIdCandidates } },
            { 'doctorId._id': { $in: doctorIdCandidates } },
          ],
        },
        {
          $or: [
            { patientId: { $in: patientIdCandidates } },
            { 'patientId._id': { $in: patientIdCandidates } },
          ],
        },
      ],
    });
    this.logger.log(`createConversation appointmentFound=${!!appointmentExists}`);

    if (!appointmentExists) {
      throw new ForbiddenException('No appointment found between this doctor and patient');
    }

    // Check if conversation already exists
    let conversation = await this.conversationModel.findOne({
      doctorId: { $in: doctorIdCandidates },
      patientId: { $in: patientIdCandidates },
    });

    if (!conversation) {
      if (!Types.ObjectId.isValid(doctorId) || !Types.ObjectId.isValid(patientId)) {
        throw new ForbiddenException('Invalid doctor or patient ID format');
      }
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