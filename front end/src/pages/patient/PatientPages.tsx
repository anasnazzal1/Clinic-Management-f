import { useEffect, useState } from 'react';
import { appointmentsApi, visitsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { User, Calendar } from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
  }, []);

  const upcoming = appts.filter(a => a.status === 'pending');
  const completed = appts.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name}</h2><p className="text-sm text-muted-foreground">Your health dashboard.</p></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card"><CardContent className="pt-5 flex items-center gap-4"><User className="w-8 h-8 text-primary" /><div><div className="font-medium text-foreground">{user?.name}</div><div className="text-xs text-muted-foreground">{user?.email}</div></div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-warning">{upcoming.length}</div><div className="text-xs text-muted-foreground mt-1">Upcoming Appointments</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-success">{completed.length}</div><div className="text-xs text-muted-foreground mt-1">Past Visits</div></CardContent></Card>
      </div>
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
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    visitsApi.getAll().then(r => setVisits(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">Medical History</h2><p className="text-sm text-muted-foreground">Your visit records and diagnoses.</p></div>
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
    </div>
  );
};
