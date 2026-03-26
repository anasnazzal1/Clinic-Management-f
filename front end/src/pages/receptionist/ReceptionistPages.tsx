import { useState, useEffect } from 'react';
import { appointmentsApi, patientsApi, doctorsApi, clinicsApi } from '@/lib/api';
import { validateCredentials, hasCredentialErrors, type CredentialErrors } from '@/lib/validateCredentials';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';

export const ReceptionistDashboard = () => {
  const [appts, setAppts] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    appointmentsApi.getAll({ status: 'pending' }).then(r => setAppts(r.data)).catch(() => {});
    patientsApi.getAll().then(r => setPatients(r.data)).catch(() => {});
    doctorsApi.getAll().then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">Receptionist Dashboard</h2><p className="text-sm text-muted-foreground">Manage patients and appointments.</p></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-primary">{appts.length}</div><div className="text-xs text-muted-foreground mt-1">Upcoming Appointments</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-info">{patients.length}</div><div className="text-xs text-muted-foreground mt-1">Total Patients</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-success">{doctors.length}</div><div className="text-xs text-muted-foreground mt-1">Doctors Available</div></CardContent></Card>
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Upcoming Appointments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Patient</th><th className="text-left py-2 font-medium">Doctor</th><th className="text-left py-2 font-medium hidden md:table-cell">Department</th><th className="text-left py-2 font-medium">Date</th><th className="text-left py-2 font-medium">Status</th></tr></thead>
              <tbody>
                {appts.map(a => (
                  <tr key={a._id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{a.patientId?.name || '—'}</td>
                    <td className="py-2.5">{a.doctorId?.name || '—'}</td>
                    <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '—'}</td>
                    <td className="py-2.5">{a.date} {a.time}</td>
                    <td className="py-2.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {appts.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No upcoming appointments.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AddPatientPage = () => {
  const emptyForm = { name: '', age: '', gender: '', phone: '', email: '', address: '', username: '', password: '' };
  const [form, setForm] = useState(emptyForm);
  const [credErrors, setCredErrors] = useState<CredentialErrors>({});

  const setField = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (key === 'username' || key === 'password') {
      setCredErrors(e => ({ ...e, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const errors = validateCredentials(form.username, form.password, true);
    setCredErrors(errors);
    if (hasCredentialErrors(errors)) return;
    try {
      const { data: patient } = await patientsApi.create({ name: form.name, age: Number(form.age), gender: form.gender, phone: form.phone, email: form.email, address: form.address });
      const { usersApi: ua } = await import('@/lib/api');
      await ua.register({ username: form.username, password: form.password, role: 'patient', name: form.name, email: form.email, linkedId: patient._id });
      toast.success('Patient account created successfully');
      setForm(emptyForm);
      setCredErrors({});
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create patient'); }
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-2xl space-y-6">
        <div><h2 className="font-display text-2xl font-bold text-foreground">Add New Patient</h2><p className="text-sm text-muted-foreground">Register a new patient with login credentials.</p></div>
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setField('name', e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => setField('age', e.target.value)} /></div>
              <div><Label>Gender <span className="text-destructive">*</span></Label>
                <Select value={form.gender} onValueChange={v => setField('gender', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setField('email', e.target.value)} /></div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setField('address', e.target.value)} /></div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-foreground mb-1">Login Credentials <span className="text-destructive">*</span></p>
              <p className="text-xs text-muted-foreground mb-3">Required to give the patient access to the portal.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={e => setField('username', e.target.value)}
                  className={credErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                  placeholder="min. 4 chars, no spaces"
                />
                {credErrors.username && <p className="text-xs text-destructive">{credErrors.username}</p>}
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  className={credErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                  placeholder="min. 6 chars, letter + number"
                />
                {credErrors.password && <p className="text-xs text-destructive">{credErrors.password}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground">Create Patient Account</Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export const BookAppointmentPage = () => {
  const [form, setForm] = useState({ patientId: '', clinicId: '', doctorId: '', date: '', time: '' });
  const [patients, setPatients] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    patientsApi.getAll().then(r => setPatients(r.data)).catch(() => {});
    clinicsApi.getAll().then(r => setClinics(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    doctorsApi.getAll({ clinicId: form.clinicId || undefined }).then(r => setDoctors(r.data)).catch(() => {});
  }, [form.clinicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.time) { toast.error('All fields are required'); return; }
    try {
      await appointmentsApi.create({ patientId: form.patientId, doctorId: form.doctorId, clinicId: form.clinicId, date: form.date, time: form.time });
      toast.success('Appointment booked successfully');
      setForm({ patientId: '', clinicId: '', doctorId: '', date: '', time: '' });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to book appointment'); }
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-2xl space-y-6">
        <div><h2 className="font-display text-2xl font-bold text-foreground">Book Appointment</h2><p className="text-sm text-muted-foreground">Schedule a new appointment for a patient.</p></div>
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Patient</Label>
              <Select value={form.patientId} onValueChange={v => setForm(f => ({ ...f, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.clinicId} onValueChange={v => setForm(f => ({ ...f, clinicId: v, doctorId: '' }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{clinics.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor</Label>
              <Select value={form.doctorId} onValueChange={v => setForm(f => ({ ...f, doctorId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>{doctors.map(d => <SelectItem key={d._id} value={d._id}>{d.name} — {d.specialization}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date</Label><DatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))} /></div>
              <div><Label>Time</Label><TimePicker value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} /></div>
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground">Book Appointment</Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export const ReceptionAppointmentsPage = () => {
  const [appts, setAppts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
  }, []);

  const filtered = appts.filter(a => (a.patientId?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">All Appointments</h2></div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by patient..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Patient</th><th className="text-left py-2 font-medium">Doctor</th><th className="text-left py-2 font-medium hidden md:table-cell">Department</th><th className="text-left py-2 font-medium">Date</th><th className="text-left py-2 font-medium">Status</th></tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{a.patientId?.name || '—'}</td>
                  <td className="py-2.5">{a.doctorId?.name || '—'}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '—'}</td>
                  <td className="py-2.5">{a.date} {a.time}</td>
                  <td className="py-2.5"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No appointments found.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
