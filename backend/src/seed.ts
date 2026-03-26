import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGO_URI = 'mongodb://localhost:27017/clinic';

const ClinicSchema = new mongoose.Schema({ name: String, workingHours: String, workingDays: String });
const DoctorSchema = new mongoose.Schema({ name: String, specialization: String, phone: String, email: String, clinicId: mongoose.Types.ObjectId, workingDays: String, workingHours: String });
const PatientSchema = new mongoose.Schema({ name: String, age: Number, gender: String, phone: String, email: String, address: String });
const ReceptionistSchema = new mongoose.Schema({ name: String, phone: String, email: String });
const UserSchema = new mongoose.Schema({ username: String, password: String, role: String, name: String, email: String, linkedId: String });
const AppointmentSchema = new mongoose.Schema({ patientId: mongoose.Types.ObjectId, doctorId: mongoose.Types.ObjectId, clinicId: mongoose.Types.ObjectId, date: String, time: String, status: String, notes: String, diagnosis: String });
const VisitSchema = new mongoose.Schema({ appointmentId: mongoose.Types.ObjectId, patientId: mongoose.Types.ObjectId, doctorId: mongoose.Types.ObjectId, date: String, notes: String, diagnosis: String });

const ClinicModel = mongoose.model('Clinic', ClinicSchema);
const DoctorModel = mongoose.model('Doctor', DoctorSchema);
const PatientModel = mongoose.model('Patient', PatientSchema);
const ReceptionistModel = mongoose.model('Receptionist', ReceptionistSchema);
const UserModel = mongoose.model('User', UserSchema);
const AppointmentModel = mongoose.model('Appointment', AppointmentSchema);
const VisitModel = mongoose.model('Visit', VisitSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await ClinicModel.deleteMany({});
  await DoctorModel.deleteMany({});
  await PatientModel.deleteMany({});
  await ReceptionistModel.deleteMany({});
  await UserModel.deleteMany({});
  await AppointmentModel.deleteMany({});
  await VisitModel.deleteMany({});

  // Clinics
  const [c1, c2, c3] = await ClinicModel.insertMany([
    { name: 'Cardiology', workingHours: '8:00 AM - 6:00 PM', workingDays: 'Mon - Fri' },
    { name: 'Pediatrics', workingHours: '9:00 AM - 5:00 PM', workingDays: 'Mon - Sat' },
    { name: 'Orthopedics', workingHours: '7:00 AM - 8:00 PM', workingDays: 'Mon - Sun' },
  ]);

  // Doctors
  const [d1, d2, d3, d4] = await DoctorModel.insertMany([
    { name: 'Dr. Sarah Mitchell', specialization: 'Cardiology', phone: '(555) 111-1111', email: 'sarah@clinic.com', clinicId: c1._id, workingDays: 'Mon, Wed, Fri', workingHours: '9:00 AM - 3:00 PM' },
    { name: 'Dr. James Carter', specialization: 'Dermatology', phone: '(555) 222-2222', email: 'james@clinic.com', clinicId: c1._id, workingDays: 'Tue, Thu', workingHours: '10:00 AM - 4:00 PM' },
    { name: 'Dr. Emily Chen', specialization: 'Pediatrics', phone: '(555) 333-3333', email: 'emily@clinic.com', clinicId: c2._id, workingDays: 'Mon - Fri', workingHours: '8:00 AM - 2:00 PM' },
    { name: 'Dr. Michael Osei', specialization: 'Orthopedics', phone: '(555) 444-4444', email: 'michael@clinic.com', clinicId: c3._id, workingDays: 'Mon, Tue, Thu', workingHours: '8:00 AM - 5:00 PM' },
  ]);

  // Patients
  const [p1, p2, p3, p4] = await PatientModel.insertMany([
    { name: 'Alice Johnson', age: 34, gender: 'Female', phone: '(555) 501-0001', email: 'alice@mail.com', address: '10 Elm St' },
    { name: 'Bob Williams', age: 52, gender: 'Male', phone: '(555) 502-0002', email: 'bob@mail.com', address: '22 Oak Ave' },
    { name: 'Clara Davis', age: 28, gender: 'Female', phone: '(555) 503-0003', email: 'clara@mail.com', address: '33 Pine Rd' },
    { name: 'David Lee', age: 45, gender: 'Male', phone: '(555) 504-0004', email: 'david@mail.com', address: '44 Maple Dr' },
  ]);

  // Receptionists
  const [r1, r2] = await ReceptionistModel.insertMany([
    { name: 'Nancy Drew', phone: '(555) 601-0001', email: 'nancy@clinic.com' },
    { name: 'Tom Hardy', phone: '(555) 602-0002', email: 'tom@clinic.com' },
  ]);

  // Users
  const hash = async (p) => bcrypt.hash(p, 10);
  await UserModel.insertMany([
    { username: 'admin', password: await hash('admin123'), role: 'admin', name: 'System Admin', email: 'admin@clinic.com' },
    { username: 'dr.sarah', password: await hash('doctor123'), role: 'doctor', name: 'Dr. Sarah Mitchell', email: 'sarah@clinic.com', linkedId: d1._id.toString() },
    { username: 'nancy', password: await hash('recep123'), role: 'receptionist', name: 'Nancy Drew', email: 'nancy@clinic.com', linkedId: r1._id.toString() },
    { username: 'alice', password: await hash('patient123'), role: 'patient', name: 'Alice Johnson', email: 'alice@mail.com', linkedId: p1._id.toString() },
  ]);

  // Appointments
  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const future = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };
  const past = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };

  const [a1, , , a4, , a6] = await AppointmentModel.insertMany([
    { patientId: p1._id, doctorId: d1._id, clinicId: c1._id, date: future(1), time: '10:00 AM', status: 'pending' },
    { patientId: p2._id, doctorId: d3._id, clinicId: c2._id, date: future(1), time: '11:00 AM', status: 'pending' },
    { patientId: p3._id, doctorId: d1._id, clinicId: c1._id, date: future(2), time: '09:00 AM', status: 'pending' },
    { patientId: p1._id, doctorId: d2._id, clinicId: c1._id, date: past(7), time: '02:00 PM', status: 'completed', notes: 'Skin rash examined. Prescribed topical cream.', diagnosis: 'Contact Dermatitis' },
    { patientId: p4._id, doctorId: d4._id, clinicId: c3._id, date: future(3), time: '08:00 AM', status: 'pending' },
    { patientId: p2._id, doctorId: d1._id, clinicId: c1._id, date: past(14), time: '10:00 AM', status: 'completed', notes: 'Routine cardiac checkup. All vitals normal.', diagnosis: 'Healthy' },
  ]);

  // Visits
  await VisitModel.insertMany([
    { appointmentId: a4._id, patientId: p1._id, doctorId: d2._id, date: past(7), notes: 'Skin rash examined. Prescribed topical cream.', diagnosis: 'Contact Dermatitis' },
    { appointmentId: a6._id, patientId: p2._id, doctorId: d1._id, date: past(14), notes: 'Routine cardiac checkup. All vitals normal.', diagnosis: 'Healthy' },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('Demo credentials: admin/admin123 | dr.sarah/doctor123 | nancy/recep123 | alice/patient123');
  await mongoose.disconnect();
}

seed().catch(console.error);
