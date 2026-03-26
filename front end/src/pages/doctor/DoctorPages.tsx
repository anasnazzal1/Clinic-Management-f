import { useState, useEffect } from 'react';
import { appointmentsApi, visitsApi, patientsApi, doctorsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2, XCircle, CalendarPlus, User, Stethoscope,
  Clock, FileText, TriangleAlert, Calendar, Search, X,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts]       = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch]     = useState('');
  const [patientOpen, setPatientOpen]           = useState(false);
  const [selectedPatient, setSelectedPatient]   = useState<any>(null);
  const [patientVisits, setPatientVisits]       = useState<any[]>([]);

  useEffect(() => {
    appointmentsApi.getAll().then(r => {
      const data: any[] = r.data;
      setAppts(data);
      // Derive unique patients from appointments
      const seen = new Set<string>();
      const unique: any[] = [];
      data.forEach(a => {
        const p = a.patientId;
        if (p && !seen.has(p._id ?? p)) {
          seen.add(p._id ?? p);
          unique.push(p);
        }
      });
      setPatients(unique);
    }).catch(() => {});
  }, []);

  const q = search.toLowerCase().trim();
  const filteredPatients = q
    ? patients.filter(p =>
        (p.name  ?? '').toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        (p.phone ?? '').includes(q)
      )
    : patients;

  const openPatient = async (patientId: string) => {
    try {
      const [p, v] = await Promise.all([
        patientsApi.getOne(patientId),
        visitsApi.getAll({ patientId }),
      ]);
      setSelectedPatient(p.data);
      setPatientVisits(v.data);
      setPatientOpen(true);
    } catch { toast.error('Failed to load patient profile.'); }
  };

  const pending   = appts.filter(a => a.status === 'pending');
  const completed = appts.filter(a => a.status === 'completed');
  const cancelled = appts.filter(a => a.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name}</h2>
        <p className="text-sm text-muted-foreground">Your appointment overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-primary">{appts.length}</div><div className="text-xs text-muted-foreground mt-1">Total</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-warning">{pending.length}</div><div className="text-xs text-muted-foreground mt-1">Pending</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-success">{completed.length}</div><div className="text-xs text-muted-foreground mt-1">Completed</div></CardContent></Card>
        <Card className="shadow-card"><CardContent className="pt-5 text-center"><div className="font-display text-3xl font-bold text-destructive">{cancelled.length}</div><div className="text-xs text-muted-foreground mt-1">Cancelled</div></CardContent></Card>
      </div>

      {/* Patient search */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            My Patients
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {filteredPatients.length} of {patients.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search patients by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus={false}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Patient list */}
          {filteredPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {search ? 'No patients match your search.' : 'No patients yet.'}
            </p>
          ) : (
            <div className="divide-y">
              {filteredPatients.map(p => (
                <button
                  key={p._id ?? p}
                  onClick={() => openPatient(p._id ?? p)}
                  className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-muted/40 rounded-lg px-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">
                      {(p.name ?? '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {p.name ?? '—'}
                    </p>
                    {p.phone && (
                      <p className="text-xs text-muted-foreground truncate">{p.phone}</p>
                    )}
                  </div>
                  <User className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming appointments preview */}
      {pending.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Patient</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left py-2 font-medium">Date & Time</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 5).map(a => (
                  <tr key={a._id} className="border-b last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{a.patientId?.name || '—'}</td>
                    <td className="py-2.5 hidden md:table-cell text-muted-foreground">{a.clinicId?.name || '—'}</td>
                    <td className="py-2.5 text-muted-foreground">{a.date} · {a.time}</td>
                    <td className="py-2.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Patient profile dialog (reused from appointments page) */}
      <Dialog open={patientOpen} onOpenChange={setPatientOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Patient Profile
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-3">
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Name</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.name}</p></div>
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Age</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.age}</p></div>
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Gender</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.gender}</p></div>
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Phone</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.phone}</p></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Visit History
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{patientVisits.length} record{patientVisits.length !== 1 ? 's' : ''}</span>
                </h4>
                {patientVisits.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No previous visits.</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {patientVisits.map(v => (
                      <div key={v._id} className="rounded-lg border bg-card p-3 text-sm">
                        <div className="flex justify-between text-muted-foreground text-xs mb-1"><span>{v.date}</span><span>{v.doctorId?.name || '—'}</span></div>
                        <p className="font-medium text-foreground">{v.diagnosis || '—'}</p>
                        {v.notes && <p className="text-muted-foreground mt-0.5 text-xs">{v.notes}</p>}
                      </div>
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

// ── Appointments Page ─────────────────────────────────────────────────────────
export const DoctorAppointmentsPage = () => {
  const { user } = useAuth();
  const [appts, setAppts]                   = useState<any[]>([]);
  const [doctorInfo, setDoctorInfo]         = useState<any>(null);

  // Visit notes dialog
  const [visitOpen, setVisitOpen]           = useState(false);
  const [selectedAppt, setSelectedAppt]     = useState<any>(null);
  const [visitForm, setVisitForm]           = useState({ notes: '', diagnosis: '' });
  const [savingVisit, setSavingVisit]       = useState(false);

  // Patient profile dialog
  const [patientOpen, setPatientOpen]       = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientVisits, setPatientVisits]   = useState<any[]>([]);

  // Cancel confirmation
  const [cancelTarget, setCancelTarget]     = useState<any>(null);

  // Follow-up booking dialog
  const [followUpOpen, setFollowUpOpen]     = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState<any>(null);
  const [followUpForm, setFollowUpForm]     = useState({ date: '', time: '' });
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // Appointment search
  const [search, setSearch] = useState('');

  // Load appointments + doctor info
  useEffect(() => {
    appointmentsApi.getAll().then(r => setAppts(r.data)).catch(() => {});
    if (user?.linkedId) {
      doctorsApi.getAll().then(r => {
        const me = r.data.find((d: any) => d._id === user.linkedId);
        setDoctorInfo(me ?? null);
      }).catch(() => {});
    }
  }, [user?.linkedId]);

  // ── Visit notes ─────────────────────────────────────────────────────────────
  const openVisit = (a: any) => {
    setSelectedAppt(a);
    setVisitForm({ notes: a.notes || '', diagnosis: a.diagnosis || '' });
    setVisitOpen(true);
  };

  const handleSaveVisit = async () => {
    if (!selectedAppt) return;
    setSavingVisit(true);
    try {
      await appointmentsApi.update(selectedAppt._id, {
        status: 'completed',
        notes: visitForm.notes,
        diagnosis: visitForm.diagnosis,
      });
      await visitsApi.create({
        appointmentId: selectedAppt._id,
        patientId: selectedAppt.patientId?._id || selectedAppt.patientId,
        doctorId: user?.linkedId,
        date: new Date().toISOString().split('T')[0],
        notes: visitForm.notes,
        diagnosis: visitForm.diagnosis,
      });
      setAppts(prev => prev.map(a =>
        a._id === selectedAppt._id
          ? { ...a, status: 'completed', notes: visitForm.notes, diagnosis: visitForm.diagnosis }
          : a
      ));
      toast.success('Visit saved — appointment marked as completed.');
      setVisitOpen(false);
    } catch {
      toast.error('Failed to save visit.');
    } finally {
      setSavingVisit(false);
    }
  };

  // ── Cancel appointment ───────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await appointmentsApi.update(cancelTarget._id, { status: 'cancelled' });
      setAppts(prev => prev.map(a =>
        a._id === cancelTarget._id ? { ...a, status: 'cancelled' } : a
      ));
      toast.success('Appointment cancelled.');
    } catch {
      toast.error('Failed to cancel appointment.');
    } finally {
      setCancelTarget(null);
    }
  };

  // ── Patient profile ──────────────────────────────────────────────────────────
  const openPatient = async (patientId: string) => {
    try {
      const [p, v] = await Promise.all([
        patientsApi.getOne(patientId),
        visitsApi.getAll({ patientId }),
      ]);
      setSelectedPatient(p.data);
      setPatientVisits(v.data);
      setPatientOpen(true);
    } catch {
      toast.error('Failed to load patient profile.');
    }
  };

  // ── Follow-up booking ────────────────────────────────────────────────────────
  const openFollowUp = (a: any) => {
    setFollowUpTarget(a);
    setFollowUpForm({ date: '', time: '' });
    setFollowUpOpen(true);
  };

  const handleSaveFollowUp = async () => {
    if (!followUpForm.date || !followUpForm.time) {
      toast.error('Date and time are required.');
      return;
    }
    // Double-booking check
    const clash = appts.find(a =>
      a.patientId?._id === (followUpTarget?.patientId?._id || followUpTarget?.patientId) &&
      a.date === followUpForm.date &&
      a.time === followUpForm.time &&
      a.status === 'pending'
    );
    if (clash) {
      toast.error('A pending appointment already exists for this patient at that date and time.');
      return;
    }
    setSavingFollowUp(true);
    try {
      const { data: created } = await appointmentsApi.create({
        patientId: followUpTarget.patientId?._id || followUpTarget.patientId,
        doctorId:  user?.linkedId,
        clinicId:  followUpTarget.clinicId?._id || followUpTarget.clinicId,
        date:      followUpForm.date,
        time:      followUpForm.time,
      });
      setAppts(prev => [created, ...prev]);
      toast.success('Follow-up appointment booked.');
      setFollowUpOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to book follow-up.');
    } finally {
      setSavingFollowUp(false);
    }
  };

  // ── Row action buttons ───────────────────────────────────────────────────────
  const ActionButtons = ({ a }: { a: any }) => {
    if (a.status === 'pending') return (
      <div className="flex items-center justify-end gap-1 flex-wrap">
        <Button
          size="sm"
          className="bg-success/15 text-success hover:bg-success/25 border-0 gap-1"
          onClick={() => openVisit(a)}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
          onClick={() => setCancelTarget(a)}
        >
          <XCircle className="w-3.5 h-3.5" /> Cancel
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => openFollowUp(a)}
        >
          <CalendarPlus className="w-3.5 h-3.5" /> Follow-up
        </Button>
      </div>
    );
    if (a.status === 'completed') return (
      <div className="flex items-center justify-end gap-1">
        <Button size="sm" variant="ghost" className="gap-1" onClick={() => openVisit(a)}>
          <FileText className="w-3.5 h-3.5" /> View Notes
        </Button>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => openFollowUp(a)}>
          <CalendarPlus className="w-3.5 h-3.5" /> Follow-up
        </Button>
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Appointments</h2>
        <p className="text-sm text-muted-foreground">Manage your appointments and patient follow-ups.</p>
      </div>

      {/* Doctor working info banner */}
      {doctorInfo && (
        <Card className="shadow-card border-primary/20 bg-primary/5">
          <CardContent className="py-3 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Stethoscope className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{doctorInfo.specialization}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              {doctorInfo.workingDays} · {doctorInfo.workingHours}
            </span>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardContent className="pt-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search patients by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium">Patient</th>
                <th className="text-left py-2 font-medium hidden md:table-cell">Department</th>
                <th className="text-left py-2 font-medium">Date & Time</th>
                <th className="text-left py-2 font-medium">Status</th>
                <th className="text-right py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appts
                .filter(a => !search || (a.patientId?.name ?? '').toLowerCase().includes(search.toLowerCase()))
                .map(a => (
                <tr
                  key={a._id}
                  className={`border-b last:border-0 transition-colors ${
                    a.status === 'cancelled' ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-2.5">
                    <button
                      onClick={() => openPatient(a.patientId?._id || a.patientId)}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      {a.patientId?.name || '—'}
                    </button>
                  </td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">
                    {a.clinicId?.name || '—'}
                  </td>
                  <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                    <div>{a.date}</div>
                    <div className="text-xs">{a.time}</div>
                  </td>
                  <td className="py-2.5"><StatusBadge status={a.status} /></td>
                  <td className="py-2.5"><ActionButtons a={a} /></td>
                </tr>
              ))}
              {appts.filter(a => !search || (a.patientId?.name ?? '').toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    {search ? 'No appointments match your search.' : 'No appointments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Visit Notes Dialog ─────────────────────────────────────────────── */}
      <Dialog open={visitOpen} onOpenChange={setVisitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {selectedAppt?.status === 'pending' ? 'Complete Appointment' : 'Visit Notes'}
            </DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="text-sm text-muted-foreground mb-2 bg-muted/40 rounded-lg px-3 py-2">
              <span className="font-medium text-foreground">{selectedAppt.patientId?.name}</span>
              {' · '}{selectedAppt.date} {selectedAppt.time}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Diagnosis</Label>
              <Input
                value={visitForm.diagnosis}
                onChange={e => setVisitForm(f => ({ ...f, diagnosis: e.target.value }))}
                placeholder="e.g. Hypertension, Contact Dermatitis..."
                disabled={selectedAppt?.status !== 'pending'}
              />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                rows={4}
                value={visitForm.notes}
                onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Clinical observations, treatment plan..."
                disabled={selectedAppt?.status !== 'pending'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVisitOpen(false)}>
              {selectedAppt?.status === 'pending' ? 'Cancel' : 'Close'}
            </Button>
            {selectedAppt?.status === 'pending' && (
              <Button
                onClick={handleSaveVisit}
                disabled={savingVisit}
                className="bg-success text-white hover:bg-success/90 border-0 gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                {savingVisit ? 'Saving...' : 'Save & Complete'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Confirmation ────────────────────────────────────────────── */}
      <AlertDialog open={!!cancelTarget} onOpenChange={o => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/15 shrink-0">
                <TriangleAlert className="w-4 h-4 text-destructive" />
              </span>
              Cancel Appointment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cancel the appointment for{' '}
              <span className="font-medium text-foreground">
                {cancelTarget?.patientId?.name}
              </span>{' '}
              on {cancelTarget?.date} at {cancelTarget?.time}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelTarget(null)}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Patient Profile Dialog ─────────────────────────────────────────── */}
      <Dialog open={patientOpen} onOpenChange={setPatientOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Patient Profile
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-3">
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Name</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.name}</p></div>
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Age</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.age}</p></div>
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Gender</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.gender}</p></div>
                <div><span className="text-muted-foreground text-xs uppercase tracking-wide">Phone</span><p className="font-medium text-foreground mt-0.5">{selectedPatient.phone}</p></div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Visit History
                  <span className="ml-auto text-xs font-normal text-muted-foreground">{patientVisits.length} record{patientVisits.length !== 1 ? 's' : ''}</span>
                </h4>
                {patientVisits.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No previous visits.</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {patientVisits.map(v => (
                      <div key={v._id} className="rounded-lg border bg-card p-3 text-sm">
                        <div className="flex justify-between text-muted-foreground text-xs mb-1">
                          <span>{v.date}</span>
                          <span>{v.doctorId?.name || '—'}</span>
                        </div>
                        <p className="font-medium text-foreground">{v.diagnosis || '—'}</p>
                        {v.notes && <p className="text-muted-foreground mt-0.5 text-xs">{v.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Follow-up Booking Dialog ───────────────────────────────────────── */}
      <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-primary" /> Book Follow-up
            </DialogTitle>
          </DialogHeader>
          {followUpTarget && (
            <div className="text-sm text-muted-foreground mb-2 bg-muted/40 rounded-lg px-3 py-2">
              Patient:{' '}
              <span className="font-medium text-foreground">
                {followUpTarget.patientId?.name}
              </span>
              {doctorInfo && (
                <span className="ml-3 text-xs">
                  Working hours: {doctorInfo.workingDays} · {doctorInfo.workingHours}
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date</Label>
              <DatePicker
                value={followUpForm.date}
                onChange={v => setFollowUpForm(f => ({ ...f, date: v }))}
                disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
            <div className="space-y-1">
              <Label>Time</Label>
              <TimePicker
                value={followUpForm.time}
                onChange={v => setFollowUpForm(f => ({ ...f, time: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveFollowUp}
              disabled={savingFollowUp}
              className="gradient-primary border-0 text-primary-foreground gap-1"
            >
              <CalendarPlus className="w-4 h-4" />
              {savingFollowUp ? 'Booking...' : 'Book Follow-up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
