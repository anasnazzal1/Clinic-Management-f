import { Document, Types } from 'mongoose';
export declare class Doctor extends Document {
    name: string;
    specialization: string;
    phone: string;
    email: string;
    clinicId: Types.ObjectId;
    workingDays: string;
    workingHours: string;
    avatar?: string;
}
export declare const DoctorSchema: import("mongoose").Schema<Doctor, import("mongoose").Model<Doctor, any, any, any, (Document<unknown, any, Doctor, any, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Doctor, any, import("mongoose").DefaultSchemaOptions> & Doctor & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Doctor>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Doctor, Document<unknown, {}, Doctor, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    workingHours?: import("mongoose").SchemaDefinitionProperty<string, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    workingDays?: import("mongoose").SchemaDefinitionProperty<string, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    specialization?: import("mongoose").SchemaDefinitionProperty<string, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    clinicId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    avatar?: import("mongoose").SchemaDefinitionProperty<string | undefined, Doctor, Document<unknown, {}, Doctor, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Doctor & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Doctor>;
