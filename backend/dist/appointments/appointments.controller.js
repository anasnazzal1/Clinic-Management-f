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
var AppointmentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const appointment_schema_1 = require("./appointment.schema");
const patient_schema_1 = require("../patients/patient.schema");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_guard_1 = require("../common/roles.guard");
const class_validator_1 = require("class-validator");
class CreateAppointmentDto {
    patientId;
    doctorId;
    clinicId;
    date;
    time;
    notes;
    diagnosis;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "doctorId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "clinicId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "diagnosis", void 0);
class UpdateAppointmentDto {
    patientId;
    doctorId;
    clinicId;
    date;
    time;
    status;
    notes;
    diagnosis;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "doctorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "clinicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['pending', 'completed', 'cancelled', 'deleted']),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "diagnosis", void 0);
let AppointmentsController = AppointmentsController_1 = class AppointmentsController {
    model;
    patientModel;
    logger = new common_1.Logger(AppointmentsController_1.name);
    constructor(model, patientModel) {
        this.model = model;
        this.patientModel = patientModel;
    }
    async findAll(doctorId, patientId, status, req) {
        if (doctorId && !mongoose_2.Types.ObjectId.isValid(doctorId)) {
            throw new common_1.BadRequestException('Invalid doctorId query parameter.');
        }
        if (patientId && !mongoose_2.Types.ObjectId.isValid(patientId)) {
            throw new common_1.BadRequestException('Invalid patientId query parameter.');
        }
        const filter = {};
        if (doctorId)
            filter.doctorId = doctorId;
        if (patientId)
            filter.patientId = patientId;
        if (status)
            filter.status = status;
        filter.clinicId = { $nin: ['', null] };
        if (!doctorId)
            filter.doctorId = { $nin: ['', null] };
        if (!patientId)
            filter.patientId = { $nin: ['', null] };
        if (req.user.role === 'doctor') {
            filter.doctorId = req.user.linkedId;
            filter.status = { $ne: 'deleted' };
        }
        if (req.user.role === 'patient') {
            let patientLinkedId = req.user.linkedId;
            if (!patientLinkedId && req.user.email) {
                const patient = await this.patientModel.findOne({ email: req.user.email.toLowerCase() }).select('_id');
                patientLinkedId = patient?._id?.toString();
            }
            if (!patientLinkedId)
                return [];
            filter.patientId = patientLinkedId;
            filter.status = { $ne: 'deleted' };
        }
        if (req.user.role === 'receptionist')
            filter.status = { $ne: 'deleted' };
        try {
            const data = await this.model.find(filter)
                .populate('patientId', 'name')
                .populate('doctorId', 'name specialization')
                .populate('clinicId', 'name')
                .sort({ date: -1 });
            return data;
        }
        catch (error) {
            this.logger.error(`Failed loading appointments for role=${req?.user?.role}: ${error?.message}`);
            throw error;
        }
    }
    findOne(id) {
        return this.model.findById(id)
            .populate('patientId', 'name')
            .populate('doctorId', 'name specialization')
            .populate('clinicId', 'name');
    }
    create(dto, req) {
        if (req.user.role === 'doctor') {
            dto.doctorId = req.user.linkedId;
        }
        if (!mongoose_2.Types.ObjectId.isValid(dto.patientId) || !mongoose_2.Types.ObjectId.isValid(dto.doctorId) || !mongoose_2.Types.ObjectId.isValid(dto.clinicId)) {
            throw new common_1.BadRequestException('Invalid patient, doctor, or clinic ID.');
        }
        return this.model.create(dto);
    }
    update(id, dto) {
        if (dto.patientId && !mongoose_2.Types.ObjectId.isValid(dto.patientId)) {
            throw new common_1.BadRequestException('Invalid patient ID.');
        }
        if (dto.doctorId && !mongoose_2.Types.ObjectId.isValid(dto.doctorId)) {
            throw new common_1.BadRequestException('Invalid doctor ID.');
        }
        if (dto.clinicId && !mongoose_2.Types.ObjectId.isValid(dto.clinicId)) {
            throw new common_1.BadRequestException('Invalid clinic ID.');
        }
        return this.model.findByIdAndUpdate(id, dto, { new: true })
            .populate('patientId', 'name')
            .populate('doctorId', 'name specialization')
            .populate('clinicId', 'name');
    }
    softDelete(id) {
        return this.model.findByIdAndUpdate(id, { status: 'deleted' }, { new: true });
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'doctor', 'receptionist', 'patient'),
    __param(0, (0, common_1.Query)('doctorId')),
    __param(1, (0, common_1.Query)('patientId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'doctor', 'receptionist', 'patient'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'receptionist', 'doctor'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAppointmentDto, Object]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'doctor', 'receptionist'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAppointmentDto]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppointmentsController.prototype, "softDelete", null);
exports.AppointmentsController = AppointmentsController = AppointmentsController_1 = __decorate([
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __param(0, (0, mongoose_1.InjectModel)(appointment_schema_1.Appointment.name)),
    __param(1, (0, mongoose_1.InjectModel)(patient_schema_1.Patient.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map