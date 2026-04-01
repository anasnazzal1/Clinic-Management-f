"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PatientsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const patient_schema_1 = require("./patient.schema");
const user_schema_1 = require("../users/user.schema");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_guard_1 = require("../common/roles.guard");
const imageStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        const dir = (0, path_1.join)(process.cwd(), 'uploads');
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
const imageFilter = (_req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
        return cb(new common_1.BadRequestException('Only JPG and PNG images are allowed.'), false);
    }
    cb(null, true);
};
let PatientsController = PatientsController_1 = class PatientsController {
    model;
    userModel;
    logger = new common_1.Logger(PatientsController_1.name);
    constructor(model, userModel) {
        this.model = model;
        this.userModel = userModel;
    }
    findAll(search) {
        const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
        return this.model.find(filter);
    }
    findOne(id, req) {
        if (req.user.role === 'patient' && req.user.linkedId !== id)
            return null;
        return this.model.findById(id);
    }
    async create(body, file, req) {
        const requestId = `${Date.now()}`;
        this.logger.log(`[${requestId}] POST /patients — role: ${req.user?.role}`);
        const missing = [];
        if (!body.name?.trim())
            missing.push('name');
        if (!body.age)
            missing.push('age');
        if (!body.gender?.trim())
            missing.push('gender');
        if (!body.phone?.trim())
            missing.push('phone');
        if (!body.email?.trim())
            missing.push('email');
        if (!body.address?.trim())
            missing.push('address');
        if (missing.length > 0) {
            this.logger.warn(`[${requestId}] Missing fields: ${missing.join(', ')}`);
            throw new common_1.BadRequestException(`Missing required fields: ${missing.join(', ')}`);
        }
        if (!['Male', 'Female'].includes(body.gender)) {
            throw new common_1.BadRequestException('Gender must be "Male" or "Female".');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            throw new common_1.BadRequestException('Invalid email format.');
        }
        if (body.password && body.password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters.');
        }
        if (body.username) {
            const existingUser = await this.userModel.findOne({ username: body.username });
            if (existingUser) {
                this.logger.warn(`[${requestId}] Duplicate username: ${body.username}`);
                throw new common_1.ConflictException('Username already exists.');
            }
        }
        const existingPatient = await this.model.findOne({ email: body.email });
        if (existingPatient) {
            this.logger.warn(`[${requestId}] Duplicate email: ${body.email}`);
            throw new common_1.ConflictException('A patient with this email already exists.');
        }
        const profileImageUrl = file ? `/uploads/${file.filename}` : undefined;
        const patient = await this.model.create({
            name: body.name.trim(),
            age: Number(body.age),
            gender: body.gender,
            phone: body.phone.trim(),
            email: body.email.trim().toLowerCase(),
            address: body.address.trim(),
            ...(profileImageUrl && { profileImage: profileImageUrl }),
        });
        this.logger.log(`[${requestId}] Patient created: ${patient._id}`);
        let userAccount = null;
        if (body.username && body.password) {
            const hashed = await bcrypt.hash(body.password, 10);
            const user = await this.userModel.create({
                username: body.username,
                password: hashed,
                role: 'patient',
                name: patient.name,
                email: patient.email,
                linkedId: patient._id.toString(),
                ...(profileImageUrl && { profileImage: profileImageUrl }),
            });
            userAccount = { id: user._id, username: user.username, role: user.role };
            this.logger.log(`[${requestId}] User account created: ${user._id}`);
        }
        return { patient, user: userAccount };
    }
    update(id, body) {
        return this.model.findByIdAndUpdate(id, body, { new: true });
    }
    delete(id) {
        return this.model.findByIdAndDelete(id);
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'receptionist', 'doctor'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'receptionist', 'doctor', 'patient'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'receptionist'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('profileImage', {
        storage: imageStorage,
        fileFilter: imageFilter,
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'receptionist'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'receptionist'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PatientsController.prototype, "delete", null);
exports.PatientsController = PatientsController = PatientsController_1 = __decorate([
    (0, common_1.Controller)('patients'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __param(0, (0, mongoose_1.InjectModel)(patient_schema_1.Patient.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map