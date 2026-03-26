import { Model } from 'mongoose';
import { Clinic } from './clinic.schema';
declare class ClinicDto {
    name: string;
    workingHours?: string;
    workingDays?: string;
}
export declare class ClinicsController {
    private model;
    constructor(model: Model<Clinic>);
    findAll(search?: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[], import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Clinic, "find", {}>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Clinic, "findOne", {}>;
    create(dto: ClinicDto): Promise<import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: Partial<ClinicDto>): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Clinic, "findOneAndUpdate", {}>;
    delete(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Clinic, {}, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Clinic, "findOneAndDelete", {}>;
}
export {};
