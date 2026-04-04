import { Model } from 'mongoose';
import { Doctor } from './doctor.schema';
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
    constructor(model: Model<Doctor>);
    findAll(clinicId?: string, search?: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[], import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Doctor, "find", {}>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Doctor, "findOne", {}>;
    create(dto: DoctorDto): Promise<import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: Partial<DoctorDto>): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Doctor, "findOneAndUpdate", {}>;
    delete(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Doctor, {}, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Doctor, "findOneAndDelete", {}>;
}
export {};
