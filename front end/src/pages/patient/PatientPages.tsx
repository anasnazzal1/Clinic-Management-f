import { useEffect, useState } from 'react';
import { appointmentsApi, visitsApi, patientsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { User, Calendar, Printer, Stethoscope } from 'lucide-react';
import PatientPrintView from '@/components/PatientPrintView';
import { ChatButton } from '@/components/chat/ChatButton';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
  }, []);

  const upcoming = appts.filter(a => a.status === 'pending');
  const completed = appts.filter(a => a.status === 'completed');

  // Get unique doctors from appointments
  const doctors = Array.from(
    new Map(
      appts
        .filter(a => a.doctorId)
        .map(a => [a.doctorId._id, a.doctorId])
    ).values()
  );

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name}</h2><p className="text-sm text-muted-foreground">Your health dashboard.</p></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card"><CardContent className="pt-5 flex items-center gap-4"><User className="w-8 h-8 text-primary" /><div><div className="font-medium text-foreground">{user?.name}</div><div className="text-xs text-muted-foreground">{user?.email}</div></div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-warning">{upcoming.length}</div><div className="text-xs text-muted-foreground mt-1">Upcoming Appointments</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-success">{completed.length}</div><div className="text-xs text-muted-foreground mt-1">Past Visits</div></CardContent></Card>
      </div>

      {/* My Doctors */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-primary" />
            My Doctors
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No doctors yet.</p>
          ) : (
            <div className="space-y-3">
              {doctors.map(doctor => (
                <div key={doctor._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">
                        {doctor.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doctor.name}</p>
                      {doctor.specialization && (
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      )}
                    </div>
                  </div>
                  <ChatButton
                    doctorId={doctor._id}
                    patientId={user?.linkedId || ''}
                    variant="outline"
                    size="sm"
                  >
                    Chat
                  </ChatButton>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const PatientAppointmentsPage = () => {
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">My Appointments</h2></div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Doctor</th><th className="text-left py-2 font-medium hidden md:table-cell">Clinic</th><th className="text-left py-2 font-medium">Date</th><th className="text-left py-2 font-medium">Status</th></tr></thead>
            <tbody>
              {appts.map(a => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{a.doctorId?.name || '—'}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '—'}</td>
                  <td className="py-2.5">{a.date} {a.time}</td>
                  <td className="py-2.5"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {appts.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No appointments.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export const PatientHistoryPage = () => {
  const { user } = useAuth();
  const [visits, setVisits]   = useState<any[]>([]);
  const [appts, setAppts]     = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    visitsApi.getAll().then(r => setVisits(r.data)).catch(() => {});
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
    if (user?.linkedId) {
      patientsApi.getOne(user.linkedId).then(r => setProfile(r.data)).catch(() => {});
    }
  }, [user?.linkedId]);

  // Build timeline from appointments + visits for the print view
  const timeline = appts.map(a => {
    const visit = visits.find(v => (v.appointmentId?._id ?? v.appointmentId) === a._id);
    return {
      id: a._id, date: a.date, time: a.time,
      doctor: a.doctorId, clinic: a.clinicId, status: a.status,
      diagnosis: visit?.diagnosis || a.diagnosis || '—',
      notes: visit?.notes || a.notes || '—',
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  const handlePrint = () => {
    const el = document.getElementById('patient-print-area');
    if (el) el.style.display = 'block';
    window.print();
    if (el) el.style.display = 'none';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Medical History</h2>
          <p className="text-sm text-muted-foreground">Your visit records and diagnoses.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Print My Profile
        </Button>
      </div>
      {visits.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">No medical records found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {visits.map(v => (
            <Card key={v._id} className="shadow-card">
              <CardContent className="pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />{v.date}</div>
                  <div className="text-sm text-muted-foreground">{v.doctorId?.name || '—'}</div>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{v.diagnosis}</h3>
                <p className="text-sm text-muted-foreground">{v.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hidden print layout — no credentials for patient role */}
      <PatientPrintView
        patient={profile ?? { name: user?.name ?? '', email: user?.email ?? '' }}
        timeline={timeline}
        credentials={null}
        printedBy={user?.name}
      />
    </div>
  );
};
