import { useParams, useNavigate } from 'react-router-dom';
import { patients, appointments, visits, doctors, clinics } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, User, Phone, MapPin, Calendar, Stethoscope } from 'lucide-react';

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/patients')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Patients
        </Button>
        <Card className="shadow-card">
          <CardContent className="py-16 text-center text-muted-foreground">Patient not found.</CardContent>
        </Card>
      </div>
    );
  }

  const patientAppointments = appointments.filter(a => a.patientId === id);
  const patientVisits = visits.filter(v => v.patientId === id);

  // Merge appointments + visits into a unified timeline
  const timeline = patientAppointments.map(appt => {
    const visit = patientVisits.find(v => v.appointmentId === appt.id);
    return {
      id: appt.id,
      date: appt.date,
      time: appt.time,
      doctor: doctors.find(d => d.id === appt.doctorId),
      clinic: clinics.find(c => c.id === appt.clinicId),
      status: appt.status,
      diagnosis: visit?.diagnosis || appt.diagnosis || '—',
      notes: visit?.notes || appt.notes || '—',
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/patients')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Patients
      </Button>

      {/* Basic Info */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            {patient.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Age</p>
              <p className="font-medium text-foreground">{patient.age} years</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Gender</p>
              <p className="font-medium text-foreground">{patient.gender}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Email</p>
              <p className="font-medium text-foreground">{patient.email}</p>
            </div>
            <div className="flex items-start gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Phone</p>
                <p className="font-medium text-foreground">{patient.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 col-span-2 sm:col-span-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Address</p>
                <p className="font-medium text-foreground">{patient.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit History */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-primary" />
            Visit History
            <span className="ml-auto text-sm font-normal text-muted-foreground">{timeline.length} record{timeline.length !== 1 ? 's' : ''}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {timeline.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No visits recorded for this patient.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Doctor</th>
                      <th className="text-left py-2 font-medium">Department</th>
                      <th className="text-left py-2 font-medium">Diagnosis</th>
                      <th className="text-left py-2 font-medium">Notes</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map(row => (
                      <tr key={row.id} className="border-b last:border-0 align-top">
                        <td className="py-3 text-muted-foreground whitespace-nowrap">{row.date}<br /><span className="text-xs">{row.time}</span></td>
                        <td className="py-3 font-medium text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                            {row.doctor?.name || '—'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{row.doctor?.specialization}</div>
                        </td>
                        <td className="py-3 text-muted-foreground">{row.clinic?.name || '—'}</td>
                        <td className="py-3 font-medium text-foreground">{row.diagnosis}</td>
                        <td className="py-3 text-muted-foreground max-w-[200px]">
                          <span className="line-clamp-2">{row.notes}</span>
                        </td>
                        <td className="py-3"><StatusBadge status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {timeline.map(row => (
                  <div key={row.id} className="border rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{row.date} · {row.time}</span>
                      <StatusBadge status={row.status} />
                    </div>
                    <div className="font-medium text-foreground">{row.doctor?.name} <span className="text-xs text-muted-foreground font-normal">· {row.doctor?.specialization}</span></div>
                    <div className="text-muted-foreground text-xs">{row.clinic?.name}</div>
                    {row.diagnosis !== '—' && <div><span className="text-xs text-muted-foreground">Diagnosis: </span><span className="font-medium">{row.diagnosis}</span></div>}
                    {row.notes !== '—' && <div className="text-muted-foreground text-xs">{row.notes}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
