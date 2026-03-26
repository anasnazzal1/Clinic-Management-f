import { Document, Types } from 'mongoose';
export declare class Visit extends Document {
    appointmentId: Types.ObjectId;
    patientId: Types.ObjectId;
    doctorId: Types.ObjectId;
    date: string;
    notes: string;
    diagnosis: string;
}
export declare const VisitSchema: import("mongoose").Schema<Visit, import("mongoose").Model<Visit, any, any, any, (Document<unknown, any, Visit, any, import("mongoose").DefaultSchemaOptions> & Visit & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Visit, any, import("mongoose").DefaultSchemaOptions> & Visit & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Visit>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Visit, Document<unknown, {}, Visit, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    date?: import("mongoose").SchemaDefinitionProperty<string, Visit, Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Visit, Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    patientId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Visit, Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    doctorId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Visit, Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    notes?: import("mongoose").SchemaDefinitionProperty<string, Visit, Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    diagnosis?: import("mongoose").SchemaDefinitionProperty<string, Visit, Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    appointmentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Visit, Document<unknown, {}, Visit, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Visit & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Visit>;
