import { Model, Types } from 'mongoose';
import { Appointment } from './appointment.schema';
import { Patient } from '../patients/patient.schema';
declare class CreateAppointmentDto {
    patientId: string;
    doctorId: string;
    clinicId: string;
    date: string;
    time: string;
    notes?: string;
    diagnosis?: string;
}
declare class UpdateAppointmentDto {
    patientId?: string;
    doctorId?: string;
    clinicId?: string;
    date?: string;
    time?: string;
    status?: string;
    notes?: string;
    diagnosis?: string;
}
export declare class AppointmentsController {
    private model;
    private patientModel;
    private readonly logger;
    constructor(model: Model<Appointment>, patientModel: Model<Patient>);
    findAll(doctorId?: string, patientId?: string, status?: string, req?: any): Promise<(import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findOne(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Appointment, "findOne", {}>;
    create(dto: CreateAppointmentDto, req: any): Promise<import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateAppointmentDto): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Appointment, "findOneAndUpdate", {}>;
    softDelete(id: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null, import("mongoose").Document<unknown, {}, Appointment, {}, import("mongoose").DefaultSchemaOptions> & Appointment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, Appointment, "findOneAndUpdate", {}>;
}
export {};
