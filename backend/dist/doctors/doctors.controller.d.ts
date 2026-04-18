import { Model, Types } from 'mongoose';
import { Doctor } from './doctor.schema';
import { User } from '../users/user.schema';
declare class DoctorDto {
    name: string;
    specialization: string;
    phone?: string;
    email?: string;
    clinicId?: string;
    workingDays?: string;
    workingHours?: string;
    avatar?: string;
}
export declare class DoctorsController {
    private model;
    private userModel;
    constructor(model: Model<Doctor>, userModel: Model<User>);
    findAll(clinicId?: string, search?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(dto: DoctorDto): Promise<import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: Partial<DoctorDto>): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Doctor, "findOneAndUpdate", {}>;
    delete(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Doctor, "findOneAndDelete", {}>;
}
export {};
