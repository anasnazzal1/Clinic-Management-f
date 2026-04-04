"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const MONGO_URI = 'mongodb://localhost:27017/clinic';
const ClinicSchema = new mongoose_1.default.Schema({ name: String, workingHours: String, workingDays: String });
const DoctorSchema = new mongoose_1.default.Schema({ name: String, specialization: String, phone: String, email: String, clinicId: mongoose_1.default.Types.ObjectId, workingDays: String, workingHours: String });
const PatientSchema = new mongoose_1.default.Schema({ name: String, age: Number, gender: String, phone: String, email: String, address: String });
const ReceptionistSchema = new mongoose_1.default.Schema({ name: String, phone: String, email: String });
const UserSchema = new mongoose_1.default.Schema({ username: String, password: String, role: String, name: String, email: String, linkedId: String, profileImage: String });
const AppointmentSchema = new mongoose_1.default.Schema({ patientId: mongoose_1.default.Types.ObjectId, doctorId: mongoose_1.default.Types.ObjectId, clinicId: mongoose_1.default.Types.ObjectId, date: String, time: String, status: String, notes: String, diagnosis: String });
const VisitSchema = new mongoose_1.default.Schema({ appointmentId: mongoose_1.default.Types.ObjectId, patientId: mongoose_1.default.Types.ObjectId, doctorId: mongoose_1.default.Types.ObjectId, date: String, notes: String, diagnosis: String });
const ClinicModel = mongoose_1.default.model('Clinic', ClinicSchema);
const DoctorModel = mongoose_1.default.model('Doctor', DoctorSchema);
const PatientModel = mongoose_1.default.model('Patient', PatientSchema);
const ReceptionistModel = mongoose_1.default.model('Receptionist', ReceptionistSchema);
const UserModel = mongoose_1.default.model('User', UserSchema);
const AppointmentModel = mongoose_1.default.model('Appointment', AppointmentSchema);
const VisitModel = mongoose_1.default.model('Visit', VisitSchema);
async function seed() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await ClinicModel.deleteMany({});
    await DoctorModel.deleteMany({});
    await PatientModel.deleteMany({});
    await ReceptionistModel.deleteMany({});
    await UserModel.deleteMany({});
    await AppointmentModel.deleteMany({});
    await VisitModel.deleteMany({});
    const [cardiology, dermatology, pediatrics, orthopedics] = await ClinicModel.insertMany([
        { name: 'Cardiology', workingHours: '8:00 AM - 6:00 PM', workingDays: 'Mon - Fri' },
        { name: 'Dermatology', workingHours: '9:00 AM - 5:00 PM', workingDays: 'Mon - Sat' },
        { name: 'Pediatrics', workingHours: '9:00 AM - 5:00 PM', workingDays: 'Mon - Sat' },
        { name: 'Orthopedics', workingHours: '7:00 AM - 8:00 PM', workingDays: 'Mon - Sun' },
    ]);
    const [d1, d2, d3, d4, d5, d6] = await DoctorModel.insertMany([
        { name: 'Dr. Sarah Mitchell', specialization: 'Cardiology', phone: '(555) 111-1111', email: 'sarah@clinic.com', clinicId: cardiology._id, workingDays: 'Mon, Wed, Fri', workingHours: '9:00 AM - 3:00 PM' },
        { name: 'Dr. James Carter', specialization: 'Dermatology', phone: '(555) 222-2222', email: 'james@clinic.com', clinicId: dermatology._id, workingDays: 'Tue, Thu', workingHours: '10:00 AM - 4:00 PM' },
        { name: 'Dr. Emily Chen', specialization: 'Pediatrics', phone: '(555) 333-3333', email: 'emily@clinic.com', clinicId: pediatrics._id, workingDays: 'Mon - Fri', workingHours: '8:00 AM - 2:00 PM' },
        { name: 'Dr. Michael Osei', specialization: 'Orthopedics', phone: '(555) 444-4444', email: 'michael@clinic.com', clinicId: orthopedics._id, workingDays: 'Mon, Tue, Thu', workingHours: '8:00 AM - 5:00 PM' },
        { name: 'Dr. Lisa Wong', specialization: 'Cardiology', phone: '(555) 555-5555', email: 'lisa@clinic.com', clinicId: cardiology._id, workingDays: 'Tue, Thu, Sat', workingHours: '10:00 AM - 4:00 PM' },
        { name: 'Dr. Robert Kim', specialization: 'Dermatology', phone: '(555) 666-6666', email: 'robert@clinic.com', clinicId: dermatology._id, workingDays: 'Mon, Wed, Fri', workingHours: '9:00 AM - 3:00 PM' },
    ]);
    const [p1, p2, p3, p4, p5, p6, p7, p8] = await PatientModel.insertMany([
        { name: 'Alice Johnson', age: 34, gender: 'Female', phone: '(555) 501-0001', email: 'alice@mail.com', address: '10 Elm St, Springfield' },
        { name: 'Bob Williams', age: 52, gender: 'Male', phone: '(555) 502-0002', email: 'bob@mail.com', address: '22 Oak Ave, Springfield' },
        { name: 'Clara Davis', age: 28, gender: 'Female', phone: '(555) 503-0003', email: 'clara@mail.com', address: '33 Pine Rd, Springfield' },
        { name: 'David Lee', age: 45, gender: 'Male', phone: '(555) 504-0004', email: 'david@mail.com', address: '44 Maple Dr, Springfield' },
        { name: 'Emma Wilson', age: 29, gender: 'Female', phone: '(555) 505-0005', email: 'emma@mail.com', address: '55 Birch Ln, Springfield' },
        { name: 'Frank Garcia', age: 61, gender: 'Male', phone: '(555) 506-0006', email: 'frank@mail.com', address: '66 Cedar St, Springfield' },
        { name: 'Grace Taylor', age: 23, gender: 'Female', phone: '(555) 507-0007', email: 'grace@mail.com', address: '77 Spruce Ave, Springfield' },
        { name: 'Henry Brown', age: 38, gender: 'Male', phone: '(555) 508-0008', email: 'henry@mail.com', address: '88 Willow Rd, Springfield' },
    ]);
    const [r1, r2] = await ReceptionistModel.insertMany([
        { name: 'Nancy Drew', phone: '(555) 601-0001', email: 'nancy@clinic.com' },
        { name: 'Tom Hardy', phone: '(555) 602-0002', email: 'tom@clinic.com' },
    ]);
    const hash = async (p) => bcrypt_1.default.hash(p, 10);
    await UserModel.insertMany([
        { username: 'admin', password: await hash('admin123'), role: 'admin', name: 'System Admin', email: 'admin@clinic.com' },
        { username: 'dr.sarah', password: await hash('doctor123'), role: 'doctor', name: 'Dr. Sarah Mitchell', email: 'sarah@clinic.com', linkedId: d1._id.toString() },
        { username: 'dr.james', password: await hash('doctor123'), role: 'doctor', name: 'Dr. James Carter', email: 'james@clinic.com', linkedId: d2._id.toString() },
        { username: 'dr.emily', password: await hash('doctor123'), role: 'doctor', name: 'Dr. Emily Chen', email: 'emily@clinic.com', linkedId: d3._id.toString() },
        { username: 'dr.michael', password: await hash('doctor123'), role: 'doctor', name: 'Dr. Michael Osei', email: 'michael@clinic.com', linkedId: d4._id.toString() },
        { username: 'dr.lisa', password: await hash('doctor123'), role: 'doctor', name: 'Dr. Lisa Wong', email: 'lisa@clinic.com', linkedId: d5._id.toString() },
        { username: 'dr.robert', password: await hash('doctor123'), role: 'doctor', name: 'Dr. Robert Kim', email: 'robert@clinic.com', linkedId: d6._id.toString() },
        { username: 'nancy', password: await hash('recep123'), role: 'receptionist', name: 'Nancy Drew', email: 'nancy@clinic.com', linkedId: r1._id.toString() },
        { username: 'tom', password: await hash('recep123'), role: 'receptionist', name: 'Tom Hardy', email: 'tom@clinic.com', linkedId: r2._id.toString() },
        { username: 'alice', password: await hash('patient123'), role: 'patient', name: 'Alice Johnson', email: 'alice@mail.com', linkedId: p1._id.toString() },
        { username: 'bob', password: await hash('patient123'), role: 'patient', name: 'Bob Williams', email: 'bob@mail.com', linkedId: p2._id.toString() },
        { username: 'clara', password: await hash('patient123'), role: 'patient', name: 'Clara Davis', email: 'clara@mail.com', linkedId: p3._id.toString() },
        { username: 'david', password: await hash('patient123'), role: 'patient', name: 'David Lee', email: 'david@mail.com', linkedId: p4._id.toString() },
        { username: 'emma', password: await hash('patient123'), role: 'patient', name: 'Emma Wilson', email: 'emma@mail.com', linkedId: p5._id.toString() },
        { username: 'frank', password: await hash('patient123'), role: 'patient', name: 'Frank Garcia', email: 'frank@mail.com', linkedId: p6._id.toString() },
        { username: 'grace', password: await hash('patient123'), role: 'patient', name: 'Grace Taylor', email: 'grace@mail.com', linkedId: p7._id.toString() },
        { username: 'henry', password: await hash('patient123'), role: 'patient', name: 'Henry Brown', email: 'henry@mail.com', linkedId: p8._id.toString() },
    ]);
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const future = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };
    const past = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
    const appointments = await AppointmentModel.insertMany([
        { patientId: p1._id, doctorId: d1._id, clinicId: cardiology._id, date: future(1), time: '10:00 AM', status: 'pending' },
        { patientId: p2._id, doctorId: d3._id, clinicId: pediatrics._id, date: future(1), time: '11:00 AM', status: 'pending' },
        { patientId: p3._id, doctorId: d1._id, clinicId: cardiology._id, date: future(2), time: '09:00 AM', status: 'pending' },
        { patientId: p4._id, doctorId: d4._id, clinicId: orthopedics._id, date: future(3), time: '08:00 AM', status: 'pending' },
        { patientId: p5._id, doctorId: d2._id, clinicId: dermatology._id, date: future(2), time: '02:00 PM', status: 'pending' },
        { patientId: p6._id, doctorId: d5._id, clinicId: cardiology._id, date: future(4), time: '10:30 AM', status: 'pending' },
        { patientId: p1._id, doctorId: d2._id, clinicId: dermatology._id, date: past(7), time: '02:00 PM', status: 'completed', notes: 'Skin rash examined. Prescribed topical cream.', diagnosis: 'Contact Dermatitis' },
        { patientId: p2._id, doctorId: d1._id, clinicId: cardiology._id, date: past(14), time: '10:00 AM', status: 'completed', notes: 'Routine cardiac checkup. All vitals normal.', diagnosis: 'Healthy' },
        { patientId: p3._id, doctorId: d6._id, clinicId: dermatology._id, date: past(3), time: '03:00 PM', status: 'completed', notes: 'Acne treatment consultation.', diagnosis: 'Mild Acne' },
        { patientId: p4._id, doctorId: d4._id, clinicId: orthopedics._id, date: past(10), time: '09:00 AM', status: 'completed', notes: 'Knee pain assessment.', diagnosis: 'Mild Arthritis' },
        { patientId: p7._id, doctorId: d3._id, clinicId: pediatrics._id, date: past(5), time: '01:00 PM', status: 'canceled', notes: 'Patient canceled due to scheduling conflict.' },
        { patientId: p8._id, doctorId: d5._id, clinicId: cardiology._id, date: future(1), time: '04:00 PM', status: 'canceled', notes: 'Doctor unavailable.' },
    ]);
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    await VisitModel.insertMany(completedAppointments.map(a => ({
        appointmentId: a._id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        date: a.date,
        notes: a.notes,
        diagnosis: a.diagnosis,
    })));
    console.log('✅ Database seeded successfully!');
    console.log('Demo credentials:');
    console.log('Admin: admin/admin123');
    console.log('Doctors: dr.sarah/doctor123, dr.james/doctor123, dr.emily/doctor123, dr.michael/doctor123, dr.lisa/doctor123, dr.robert/doctor123');
    console.log('Receptionists: nancy/recep123, tom/recep123');
    console.log('Patients: alice/patient123, bob/patient123, clara/patient123, david/patient123, emma/patient123, frank/patient123, grace/patient123, henry/patient123');
    await mongoose_1.default.disconnect();
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map