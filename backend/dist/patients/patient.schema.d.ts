import { Document } from 'mongoose';
export declare class Patient extends Document {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    address: string;
    profileImage?: string;
}
export declare const PatientSchema: import("mongoose").Schema<Patient, import("mongoose").Model<Patient, any, any, any, (Document<unknown, any, Patient, any, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Patient, any, import("mongoose").DefaultSchemaOptions> & Patient & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, Patient>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Patient, Document<unknown, {}, Patient, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    profileImage?: import("mongoose").SchemaDefinitionProperty<string | undefined, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phone?: import("mongoose").SchemaDefinitionProperty<string, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    age?: import("mongoose").SchemaDefinitionProperty<number, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    gender?: import("mongoose").SchemaDefinitionProperty<string, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    address?: import("mongoose").SchemaDefinitionProperty<string, Patient, Document<unknown, {}, Patient, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Patient & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Patient>;
