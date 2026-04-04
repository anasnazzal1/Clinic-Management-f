import { Model } from 'mongoose';
import { Visit } from './visit.schema';
declare class CreateVisitDto {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    date: string;
    notes?: string;
    diagnosis?: string;
}
export declare class VisitsController {
    private model;
    constructor(model: Model<Visit>);
    findAll(patientId?: string, doctorId?: string, req?: any): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Visit, {}, import("mongoose").DefaultSchemaOptions> & Visit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[], import("mongoose").Document<unknown, {}, Visit, {}, import("mongoose").DefaultSchemaOptions> & Visit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Visit, "find", {}>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Visit, {}, import("mongoose").DefaultSchemaOptions> & Visit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Visit, {}, import("mongoose").DefaultSchemaOptions> & Visit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Visit, "findOne", {}>;
    create(dto: CreateVisitDto): Promise<import("mongoose").Document<unknown, {}, Visit, {}, import("mongoose").DefaultSchemaOptions> & Visit & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
export {};
