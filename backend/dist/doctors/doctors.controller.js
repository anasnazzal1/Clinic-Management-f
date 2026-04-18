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
exports.DoctorsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const doctor_schema_1 = require("./doctor.schema");
const user_schema_1 = require("../users/user.schema");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_guard_1 = require("../common/roles.guard");
const class_validator_1 = require("class-validator");
class DoctorDto {
    name;
    specialization;
    phone;
    email;
    clinicId;
    workingDays;
    workingHours;
    avatar;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "specialization", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "clinicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "workingDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "workingHours", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDto.prototype, "avatar", void 0);
let DoctorsController = class DoctorsController {
    model;
    userModel;
    constructor(model, userModel) {
        this.model = model;
        this.userModel = userModel;
    }
    async findAll(clinicId, search) {
        const filter = {};
        if (clinicId) {
            if (mongoose_2.Types.ObjectId.isValid(clinicId)) {
                filter.clinicId = { $in: [clinicId, new mongoose_2.Types.ObjectId(clinicId)] };
            }
            else {
                filter.clinicId = { $ne: null };
            }
        }
        if (search)
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
            ];
        const doctors = await this.model.find(filter).populate('clinicId', 'name').lean();
        const doctorIds = doctors.map(d => d._id.toString());
        const linkedUsers = await this.userModel
            .find({ role: 'doctor', linkedId: { $in: doctorIds } })
            .select('linkedId profileImage')
            .lean();
        const imageByLinkedId = new Map(linkedUsers.map(u => [u.linkedId, u.profileImage]));
        return doctors.map((doctor) => ({
            ...doctor,
            profileImage: doctor.avatar || imageByLinkedId.get(doctor._id.toString()) || null,
        }));
    }
    async findOne(id) {
        const doctor = await this.model.findById(id).populate('clinicId', 'name').lean();
        if (!doctor)
            return null;
        const linkedUser = await this.userModel
            .findOne({ role: 'doctor', linkedId: doctor._id.toString() })
            .select('profileImage')
            .lean();
        return {
            ...doctor,
            profileImage: doctor.avatar || linkedUser?.profileImage || null,
        };
    }
    create(dto) {
        return this.model.create(dto);
    }
    update(id, dto) {
        return this.model.findByIdAndUpdate(id, dto, { new: true });
    }
    delete(id) {
        return this.model.findByIdAndDelete(id);
    }
};
exports.DoctorsController = DoctorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('clinicId')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DoctorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DoctorDto]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DoctorsController.prototype, "delete", null);
exports.DoctorsController = DoctorsController = __decorate([
    (0, common_1.Controller)('doctors'),
    __param(0, (0, mongoose_1.InjectModel)(doctor_schema_1.Doctor.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DoctorsController);
//# sourceMappingURL=doctors.controller.js.map