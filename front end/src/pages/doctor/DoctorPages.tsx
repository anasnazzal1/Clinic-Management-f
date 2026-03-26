import { useState, useEffect } from 'react';
import { appointmentsApi, visitsApi, patientsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
  }, []);

  const pending = appts.filter(a => a.status === 'pending');
  const completed = appts.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name}</h2><p className="text-sm text-muted-foreground">Your appointment overview.</p></div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-primary">{appts.length}</div><div className="text-xs text-muted-foreground mt-1">Total Appointments</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-warning">{pending.length}</div><div className="text-xs text-muted-foreground mt-1">Pending</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-success">{completed.length}</div><div className="text-xs text-muted-foreground mt-1">Completed</div></CardContent></Card>
      </div>
    </div>
  );
};

export const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [visitOpen, setVisitOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [patientOpen, setPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientVisits, setPatientVisits] = useState<any[]>([]);
  const [visitForm, setVisitForm] = useState({ notes: '', diagnosis: '' });

  useEffect(() => {
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
  }, []);

  const openVisit = (a: any) => { setSelectedAppt(a); setVisitForm({ notes: a.notes || '', diagnosis: a.diagnosis || '' }); setVisitOpen(true); };

  const openPatient = async (patientId: string) => {
    try {
      const [p, v] = await Promise.all([patientsApi.getOne(patientId), visitsApi.getAll({ patientId })]);
      setSelectedPatient(p.data);
      setPatientVisits(v.data);
      setPatientOpen(true);
    } catch { toast.error('Failed to load patient'); }
  };

  const handleSaveVisit = async () => {
    if (!selectedAppt) return;
    try {
      await appointmentsApi.update(selectedAppt._id, { status: 'completed', notes: visitForm.notes, diagnosis: visitForm.diagnosis });
      await visitsApi.create({ appointmentId: selectedAppt._id, patientId: selectedAppt.patientId?._id || selectedAppt.patientId, doctorId: user?.linkedId, date: new Date().toISOString().split('T')[0], notes: visitForm.notes, diagnosis: visitForm.diagnosis });
      setAppts(prev => prev.map(a => a._id === selectedAppt._id ? { ...a, status: 'completed', notes: visitForm.notes, diagnosis: visitForm.diagnosis } : a));
      toast.success('Visit saved and appointment completed');
      setVisitOpen(false);
    } catch { toast.error('Failed to save visit'); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="font-display text-2xl font-bold text-foreground">My Appointments</h2></div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Patient</th><th className="text-left py-2 font-medium hidden md:table-cell">Department</th><th className="text-left py-2 font-medium">Date</th><th className="text-left py-2 font-medium">Status</th><th className="text-right py-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {appts.map(a => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-2.5">
                    <button onClick={() => openPatient(a.patientId?._id || a.patientId)} className="font-medium text-primary hover:underline">
                      {a.patientId?.name || '—'}
                    </button>
                  </td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '—'}</td>
                  <td className="py-2.5">{a.date} {a.time}</td>
                  <td className="py-2.5"><StatusBadge status={a.status} /></td>
                  <td className="py-2.5 text-right">
                    {a.status === 'pending' ? (
                      <Button size="sm" variant="outline" onClick={() => openVisit(a)}>Add Notes</Button>
                    ) : a.status === 'completed' ? (
                      <Button size="sm" variant="ghost" onClick={() => openVisit(a)}>View Notes</Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {appts.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No appointments.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Visit Notes</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Diagnosis</Label><Input value={visitForm.diagnosis} onChange={e => setVisitForm(f => ({ ...f, diagnosis: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea rows={4} value={visitForm.notes} onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            {selectedAppt?.status === 'pending' ? (
              <Button onClick={handleSaveVisit} className="gradient-primary border-0 text-primary-foreground">Save & Complete</Button>
            ) : (
              <Button variant="outline" onClick={() => setVisitOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={patientOpen} onOpenChange={setPatientOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Patient Profile</DialogTitle></DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{selectedPatient.name}</span></div>
                <div><span className="text-muted-foreground">Age:</span> <span className="font-medium text-foreground">{selectedPatient.age}</span></div>
                <div><span className="text-muted-foreground">Gender:</span> <span className="font-medium text-foreground">{selectedPatient.gender}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{selectedPatient.phone}</span></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-display font-semibold text-foreground mb-3">Visit History</h4>
                {patientVisits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No previous visits.</p>
                ) : (
                  <div className="space-y-3">
                    {patientVisits.map(v => (
                      <Card key={v._id} className="shadow-card">
                        <CardContent className="pt-4 pb-3 text-sm">
                          <div className="flex justify-between text-muted-foreground mb-1"><span>{v.date}</span><span>{v.doctorId?.name || '—'}</span></div>
                          <p className="font-medium text-foreground">{v.diagnosis}</p>
                          <p className="text-muted-foreground mt-1">{v.notes}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
