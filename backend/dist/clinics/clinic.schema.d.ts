import { Document } from 'mongoose';
export declare class Clinic extends Document {
    name: string;
    workingHours: string;
    workingDays: string;
}
export declare const ClinicSchema: import("mongoose").Schema<Clinic, import("mongoose").Model<Clinic, any, any, any, (Document<unknown, any, Clinic, any, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Clinic, any, import("mongoose").DefaultSchemaOptions> & Clinic & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, Clinic>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Clinic, Document<unknown, {}, Clinic, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Clinic & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Clinic, Document<unknown, {}, Clinic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Clinic, Document<unknown, {}, Clinic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    workingHours?: import("mongoose").SchemaDefinitionProperty<string, Clinic, Document<unknown, {}, Clinic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    workingDays?: import("mongoose").SchemaDefinitionProperty<string, Clinic, Document<unknown, {}, Clinic, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Clinic & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Clinic>;
