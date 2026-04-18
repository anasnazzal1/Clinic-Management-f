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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("./conversation.schema");
const message_schema_1 = require("./message.schema");
const appointment_schema_1 = require("../appointments/appointment.schema");
const user_schema_1 = require("../users/user.schema");
let ChatService = ChatService_1 = class ChatService {
    conversationModel;
    messageModel;
    appointmentModel;
    userModel;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(conversationModel, messageModel, appointmentModel, userModel) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
        this.appointmentModel = appointmentModel;
        this.userModel = userModel;
    }
    normalizeId(value) {
        if (!value)
            return '';
        if (typeof value === 'string')
            return value.trim();
        if (typeof value === 'object' && value !== null) {
            const candidate = value._id ?? value.id;
            if (candidate)
                return String(candidate).trim();
        }
        return String(value).trim();
    }
    buildIdCandidates(value) {
        const normalized = this.normalizeId(value);
        if (!normalized)
            return [];
        const candidates = [normalized];
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            candidates.push(new mongoose_2.Types.ObjectId(normalized));
        }
        return candidates;
    }
    async createOrGetConversation(createConversationDto, userId, userRole) {
        const doctorId = this.normalizeId(createConversationDto.doctorId);
        const patientId = this.normalizeId(createConversationDto.patientId);
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let isAuthorized = false;
        if (userRole === 'doctor' && this.normalizeId(user.linkedId) === doctorId) {
            isAuthorized = true;
        }
        else if (userRole === 'patient' && this.normalizeId(user.linkedId) === patientId) {
            isAuthorized = true;
        }
        if (!isAuthorized) {
            throw new common_1.ForbiddenException('Access denied');
        }
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
            throw new common_1.ForbiddenException('No appointment found between this doctor and patient');
        }
        let conversation = await this.conversationModel.findOne({
            doctorId: { $in: doctorIdCandidates },
            patientId: { $in: patientIdCandidates },
        });
        if (!conversation) {
            if (!mongoose_2.Types.ObjectId.isValid(doctorId) || !mongoose_2.Types.ObjectId.isValid(patientId)) {
                throw new common_1.ForbiddenException('Invalid doctor or patient ID format');
            }
            conversation = new this.conversationModel({
                doctorId: new mongoose_2.Types.ObjectId(doctorId),
                patientId: new mongoose_2.Types.ObjectId(patientId),
            });
            await conversation.save();
        }
        return conversation;
    }
    async getConversations(userId, userRole) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let filter = {};
        if (userRole === 'doctor') {
            filter = { doctorId: new mongoose_2.Types.ObjectId(user.linkedId) };
        }
        else if (userRole === 'patient') {
            filter = { patientId: new mongoose_2.Types.ObjectId(user.linkedId) };
        }
        else {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.conversationModel.find(filter)
            .populate('doctorId', 'name specialization')
            .populate('patientId', 'name')
            .sort({ createdAt: -1 });
    }
    async getMessages(conversationId, userId, userRole) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        let isAuthorized = false;
        if (userRole === 'doctor' && conversation.doctorId.toString() === user.linkedId) {
            isAuthorized = true;
        }
        else if (userRole === 'patient' && conversation.patientId.toString() === user.linkedId) {
            isAuthorized = true;
        }
        if (!isAuthorized) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.messageModel.find({ conversationId: new mongoose_2.Types.ObjectId(conversationId) })
            .populate('senderId', 'name role')
            .sort({ createdAt: 1 });
    }
    async sendMessage(sendMessageDto, userId, userRole) {
        const { conversationId, message } = sendMessageDto;
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        let isAuthorized = false;
        if (userRole === 'doctor' && conversation.doctorId.toString() === user.linkedId) {
            isAuthorized = true;
        }
        else if (userRole === 'patient' && conversation.patientId.toString() === user.linkedId) {
            isAuthorized = true;
        }
        if (!isAuthorized) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const newMessage = new this.messageModel({
            conversationId: new mongoose_2.Types.ObjectId(conversationId),
            senderId: new mongoose_2.Types.ObjectId(userId),
            message,
        });
        return newMessage.save();
    }
    async markMessagesAsRead(conversationId, userId) {
        await this.messageModel.updateMany({
            conversationId: new mongoose_2.Types.ObjectId(conversationId),
            senderId: { $ne: new mongoose_2.Types.ObjectId(userId) },
            read: false
        }, { read: true });
    }
    async getUnreadCount(userId, userRole) {
        const user = await this.userModel.findById(userId);
        if (!user)
            return 0;
        let conversations = [];
        if (userRole === 'doctor') {
            conversations = await this.conversationModel.find({ doctorId: new mongoose_2.Types.ObjectId(user.linkedId) });
        }
        else if (userRole === 'patient') {
            conversations = await this.conversationModel.find({ patientId: new mongoose_2.Types.ObjectId(user.linkedId) });
        }
        if (conversations.length === 0)
            return 0;
        const conversationIds = conversations.map(c => c._id);
        const unreadCount = await this.messageModel.countDocuments({
            conversationId: { $in: conversationIds },
            senderId: { $ne: new mongoose_2.Types.ObjectId(userId) },
            read: false
        });
        return unreadCount;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(2, (0, mongoose_1.InjectModel)(appointment_schema_1.Appointment.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map