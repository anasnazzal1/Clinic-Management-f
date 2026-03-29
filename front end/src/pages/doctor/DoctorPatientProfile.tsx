import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { patientsApi, appointmentsApi, visitsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, User, Phone, MapPin, Calendar, Stethoscope, Printer, Mail } from 'lucide-react';
import PatientPrintView from '@/components/PatientPrintView';

const DoctorPatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patient, setPatient]   = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [allowed, setAllowed]   = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      patientsApi.getOne(id),
      appointmentsApi.getAll({ patientId: id }),
      visitsApi.getAll({ patientId: id }),
    ]).then(([p, appts, vis]) => {
      // Verify this patient has at least one appointment with this doctor
      const isMyPatient = appts.data.some(
        (a: any) => (a.doctorId?._id ?? a.doctorId) === user?.linkedId,
      );
      if (!isMyPatient) { setAllowed(false); setLoading(false); return; }

      setPatient(p.data);
      const visitsMap = new Map(
        vis.data.map((v: any) => [v.appointmentId?.toString?.() || v.appointmentId, v]),
      );
      const rows = appts.data
        .filter((a: any) => (a.doctorId?._id ?? a.doctorId) === user?.linkedId)
        .map((a: any) => {
          const visit = visitsMap.get(a._id);
          return {
            id: a._id, date: a.date, time: a.time,
            doctor: a.doctorId, clinic: a.clinicId, status: a.status,
            diagnosis: visit?.diagnosis || a.diagnosis || '—',
            notes: visit?.notes || a.notes || '—',
          };
        })
        .sort((a: any, b: any) => b.date.localeCompare(a.date));
      setTimeline(rows);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, user?.linkedId]);

  const handlePrint = () => {
    const el = document.getElementById('patient-print-area');
    if (el) el.style.display = 'block';
    window.print();
    if (el) el.style.display = 'none';
  };

  if (loading) return <div className="py-16 text-center text-muted-foreground">Loading...</div>;

  if (!allowed) return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/doctor')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <Card className="shadow-card">
        <CardContent className="py-16 text-center text-muted-foreground">
          You do not have access to this patient's profile.
        </CardContent>
      </Card>
    </div>
  );

  if (!patient) return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/doctor')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <Card className="shadow-card">
        <CardContent className="py-16 text-center text-muted-foreground">Patient not found.</CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Print Profile
        </Button>
      </div>

      {/* Patient Info */}
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
            <div className="flex items-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Email</p>
                <p className="font-medium text-foreground">{patient.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Phone</p>
                <p className="font-medium text-foreground">{patient.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 col-span-2">
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
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {timeline.length} record{timeline.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {timeline.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No visits recorded.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Department</th>
                      <th className="text-left py-2 font-medium">Diagnosis</th>
                      <th className="text-left py-2 font-medium">Notes</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map(row => (
                      <tr key={row.id} className="border-b last:border-0 align-top">
                        <td className="py-3 text-muted-foreground whitespace-nowrap">
                          {row.date}<br /><span className="text-xs">{row.time}</span>
                        </td>
                        <td className="py-3 text-muted-foreground">{row.clinic?.name || '—'}</td>
                        <td className="py-3 font-medium text-foreground">{row.diagnosis}</td>
                        <td className="py-3 text-muted-foreground max-w-[220px]">
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
                    <div className="text-muted-foreground text-xs">{row.clinic?.name}</div>
                    {row.diagnosis !== '—' && (
                      <div><span className="text-xs text-muted-foreground">Diagnosis: </span><span className="font-medium">{row.diagnosis}</span></div>
                    )}
                    {row.notes !== '—' && <div className="text-muted-foreground text-xs">{row.notes}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Hidden print layout — no credentials for doctor */}
      <PatientPrintView
        patient={patient}
        timeline={timeline}
        credentials={null}
        printedBy={user?.name}
      />
    </div>
  );
};

export default DoctorPatientProfile;
