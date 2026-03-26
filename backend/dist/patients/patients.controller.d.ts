import { Model } from 'mongoose';
import { Patient } from './patient.schema';
declare class PatientDto {
    name: string;
    age?: number;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
}
export declare class PatientsController {
    private model;
    constructor(model: Model<Patient>);
    findAll(search?: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[], import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Patient, "find", {}>;
    findOne(id: string, req: any): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Patient, "findOne", {}> | null;
    create(dto: PatientDto): Promise<import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: Partial<PatientDto>): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Patient, "findOneAndUpdate", {}>;
    delete(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Patient, "findOneAndDelete", {}>;
}
export {};
