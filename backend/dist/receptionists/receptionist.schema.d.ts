import { Document } from 'mongoose';
export declare class Receptionist extends Document {
    name: string;
    phone: string;
    email: string;
}
export declare const ReceptionistSchema: import("mongoose").Schema<Receptionist, import("mongoose").Model<Receptionist, any, any, any, (Document<unknown, any, Receptionist, any, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Receptionist, any, import("mongoose").DefaultSchemaOptions> & Receptionist & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, Receptionist>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Receptionist, Document<unknown, {}, Receptionist, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Receptionist & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Receptionist, Document<unknown, {}, Receptionist, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Receptionist, Document<unknown, {}, Receptionist, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Receptionist, Document<unknown, {}, Receptionist, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Receptionist, Document<unknown, {}, Receptionist, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Receptionist & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Receptionist>;
