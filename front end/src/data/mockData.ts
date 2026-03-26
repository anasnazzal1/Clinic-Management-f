export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
  linkedId?: string; // links to doctor/patient/receptionist id
}

export interface Clinic {
  id: string;
  name: string; // department/specialty name
  workingHours: string;
  workingDays: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  clinicId: string;
  workingDays: string;
  workingHours: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
}

export interface Receptionist {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  diagnosis?: string;
}

export interface Visit {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  notes: string;
  diagnosis: string;
}

export const clinics: Clinic[] = [
  { id: 'c1', name: 'Cardiology', workingHours: '8:00 AM - 6:00 PM', workingDays: 'Mon - Fri' },
  { id: 'c2', name: 'Pediatrics', workingHours: '9:00 AM - 5:00 PM', workingDays: 'Mon - Sat' },
  { id: 'c3', name: 'Orthopedics', workingHours: '7:00 AM - 8:00 PM', workingDays: 'Mon - Sun' },
];

export const doctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Mitchell', specialization: 'Cardiology', phone: '(555) 111-1111', email: 'sarah@clinic.com', clinicId: 'c1', workingDays: 'Mon, Wed, Fri', workingHours: '9:00 AM - 3:00 PM' },
  { id: 'd2', name: 'Dr. James Carter', specialization: 'Dermatology', phone: '(555) 222-2222', email: 'james@clinic.com', clinicId: 'c1', workingDays: 'Tue, Thu', workingHours: '10:00 AM - 4:00 PM' },
  { id: 'd3', name: 'Dr. Emily Chen', specialization: 'Pediatrics', phone: '(555) 333-3333', email: 'emily@clinic.com', clinicId: 'c2', workingDays: 'Mon - Fri', workingHours: '8:00 AM - 2:00 PM' },
  { id: 'd4', name: 'Dr. Michael Osei', specialization: 'Orthopedics', phone: '(555) 444-4444', email: 'michael@clinic.com', clinicId: 'c3', workingDays: 'Mon, Tue, Thu', workingHours: '8:00 AM - 5:00 PM' },
];

export const patients: Patient[] = [
  { id: 'p1', name: 'Alice Johnson', age: 34, gender: 'Female', phone: '(555) 501-0001', email: 'alice@mail.com', address: '10 Elm St' },
  { id: 'p2', name: 'Bob Williams', age: 52, gender: 'Male', phone: '(555) 502-0002', email: 'bob@mail.com', address: '22 Oak Ave' },
  { id: 'p3', name: 'Clara Davis', age: 28, gender: 'Female', phone: '(555) 503-0003', email: 'clara@mail.com', address: '33 Pine Rd' },
  { id: 'p4', name: 'David Lee', age: 45, gender: 'Male', phone: '(555) 504-0004', email: 'david@mail.com', address: '44 Maple Dr' },
];

export const receptionists: Receptionist[] = [
  { id: 'r1', name: 'Nancy Drew', phone: '(555) 601-0001', email: 'nancy@clinic.com' },
  { id: 'r2', name: 'Tom Hardy', phone: '(555) 602-0002', email: 'tom@clinic.com' },
];

export const appointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', doctorId: 'd1', clinicId: 'c1', date: '2026-03-27', time: '10:00 AM', status: 'pending' },
  { id: 'a2', patientId: 'p2', doctorId: 'd3', clinicId: 'c2', date: '2026-03-27', time: '11:00 AM', status: 'pending' },
  { id: 'a3', patientId: 'p3', doctorId: 'd1', clinicId: 'c1', date: '2026-03-28', time: '09:00 AM', status: 'pending' },
  { id: 'a4', patientId: 'p1', doctorId: 'd2', clinicId: 'c1', date: '2026-03-20', time: '02:00 PM', status: 'completed', notes: 'Skin rash examined. Prescribed topical cream.', diagnosis: 'Contact Dermatitis' },
  { id: 'a5', patientId: 'p4', doctorId: 'd4', clinicId: 'c3', date: '2026-03-29', time: '08:00 AM', status: 'pending' },
  { id: 'a6', patientId: 'p2', doctorId: 'd1', clinicId: 'c1', date: '2026-03-15', time: '10:00 AM', status: 'completed', notes: 'Routine cardiac checkup. All vitals normal.', diagnosis: 'Healthy' },
];

export const visits: Visit[] = [
  { id: 'v1', appointmentId: 'a4', patientId: 'p1', doctorId: 'd2', date: '2026-03-20', notes: 'Skin rash examined. Prescribed topical cream.', diagnosis: 'Contact Dermatitis' },
  { id: 'v2', appointmentId: 'a6', patientId: 'p2', doctorId: 'd1', date: '2026-03-15', notes: 'Routine cardiac checkup. All vitals normal.', diagnosis: 'Healthy' },
];

export const users: User[] = [
  { id: 'u1', username: 'admin', password: 'admin123', role: 'admin', name: 'System Admin', email: 'admin@clinic.com' },
  { id: 'u2', username: 'dr.sarah', password: 'doctor123', role: 'doctor', name: 'Dr. Sarah Mitchell', email: 'sarah@clinic.com', linkedId: 'd1' },
  { id: 'u3', username: 'nancy', password: 'recep123', role: 'receptionist', name: 'Nancy Drew', email: 'nancy@clinic.com', linkedId: 'r1' },
  { id: 'u4', username: 'alice', password: 'patient123', role: 'patient', name: 'Alice Johnson', email: 'alice@mail.com', linkedId: 'p1' },
];
