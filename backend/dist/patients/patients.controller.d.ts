import { Model } from 'mongoose';
import { Patient } from './patient.schema';
import { User } from '../users/user.schema';
export declare class PatientsController {
    private model;
    private userModel;
    private readonly logger;
    constructor(model: Model<Patient>, userModel: Model<User>);
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
    create(body: Record<string, any>, file: Express.Multer.File | undefined, req: any): Promise<{
        patient: any;
        user: Record<string, any> | null;
    }>;
    update(id: string, body: Partial<Record<string, any>>): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Patient, {}, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
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
