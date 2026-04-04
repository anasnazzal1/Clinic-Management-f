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
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const visit_schema_1 = require("./visit.schema");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_guard_1 = require("../common/roles.guard");
const class_validator_1 = require("class-validator");
class CreateVisitDto {
    appointmentId;
    patientId;
    doctorId;
    date;
    notes;
    diagnosis;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "appointmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "doctorId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVisitDto.prototype, "diagnosis", void 0);
let VisitsController = class VisitsController {
    model;
    constructor(model) {
        this.model = model;
    }
    findAll(patientId, doctorId, req) {
        const filter = {};
        if (patientId)
            filter.patientId = patientId;
        if (doctorId)
            filter.doctorId = doctorId;
        if (req.user.role === 'doctor')
            filter.doctorId = req.user.linkedId;
        if (req.user.role === 'patient')
            filter.patientId = req.user.linkedId;
        return this.model.find(filter)
            .populate('patientId', 'name')
            .populate('doctorId', 'name specialization')
            .sort({ date: -1 });
    }
    findOne(id) {
        return this.model.findById(id).populate('patientId', 'name').populate('doctorId', 'name');
    }
    create(dto) {
        return this.model.create(dto);
    }
};
exports.VisitsController = VisitsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'doctor', 'patient'),
    __param(0, (0, common_1.Query)('patientId')),
    __param(1, (0, common_1.Query)('doctorId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'doctor', 'patient'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('doctor'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateVisitDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "create", null);
exports.VisitsController = VisitsController = __decorate([
    (0, common_1.Controller)('visits'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __param(0, (0, mongoose_1.InjectModel)(visit_schema_1.Visit.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VisitsController);
//# sourceMappingURL=visits.controller.js.map