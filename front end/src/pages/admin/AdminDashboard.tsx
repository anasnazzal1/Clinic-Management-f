import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { clinicsApi, doctorsApi, patientsApi, receptionistsApi, appointmentsApi } from '@/lib/api';
import { Building2, Stethoscope, Users, UserPlus, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ clinics: 0, doctors: 0, patients: 0, receptionists: 0, appointments: 0 });
  const [recentAppts, setRecentAppts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      clinicsApi.getAll(),
      doctorsApi.getAll(),
      patientsApi.getAll(),
      receptionistsApi.getAll(),
      appointmentsApi.getAll(),
    ]).then(([c, d, p, r, a]) => {
      setStats({ clinics: c.data.length, doctors: d.data.length, patients: p.data.length, receptionists: r.data.length, appointments: a.data.length });
      setRecentAppts(a.data.slice(0, 5));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Departments', value: stats.clinics, icon: Building2, color: 'text-primary' },
    { label: 'Doctors', value: stats.doctors, icon: Stethoscope, color: 'text-info' },
    { label: 'Patients', value: stats.patients, icon: Users, color: 'text-success' },
    { label: 'Receptionists', value: stats.receptionists, icon: UserPlus, color: 'text-warning' },
    { label: 'Appointments', value: stats.appointments, icon: Calendar, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Admin Overview</h2>
        <p className="text-muted-foreground text-sm">Manage your entire medical center.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="pt-5 pb-4 flex flex-col items-center text-center">
              <s.icon className={`w-6 h-6 mb-2 ${s.color}`} />
              <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Appointments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Patient</th>
                  <th className="text-left py-2 font-medium">Doctor</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppts.map(a => (
                  <tr key={a._id} className="border-b last:border-0">
                    <td className="py-2.5">{a.patientId?.name || '—'}</td>
                    <td className="py-2.5">{a.doctorId?.name || '—'}</td>
                    <td className="py-2.5">{a.date} {a.time}</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === 'completed' ? 'bg-success/15 text-success' : a.status === 'cancelled' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentAppts.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No appointments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
