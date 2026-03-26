import { Model } from 'mongoose';
import { Receptionist } from './receptionist.schema';
declare class ReceptionistDto {
    name: string;
    phone?: string;
    email?: string;
}
export declare class ReceptionistsController {
    private model;
    constructor(model: Model<Receptionist>);
    findAll(search?: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[], import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Receptionist, "find", {}>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Receptionist, "findOne", {}>;
    create(dto: ReceptionistDto): Promise<import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: Partial<ReceptionistDto>): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Receptionist, "findOneAndUpdate", {}>;
    delete(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Receptionist, {}, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Receptionist, "findOneAndDelete", {}>;
}
export {};
