import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { appointmentsApi, patientsApi, doctorsApi, clinicsApi, visitsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge, AppointmentStatus } from '@/components/StatusBadge';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Plus, Pencil, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

interface Appointment {
  _id: string;
  patientId: { _id: string; name: string } | null;
  doctorId: { _id: string; name: string; specialization: string } | null;
  clinicId: { _id: string; name: string } | null;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  diagnosis?: string;
}

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'completed', 'cancelled', 'deleted'];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending:   'bg-warning/15 text-warning border-warning/30',
  completed: 'bg-success/15 text-success border-success/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  deleted:   'bg-muted text-muted-foreground border-border',
};

const emptyForm = {
  patientId: '', clinicId: '', doctorId: '',
  date: '', time: '', notes: '', diagnosis: '', status: 'pending' as AppointmentStatus,
};

const AdminAppointments = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients]         = useState<any[]>([]);
  const [clinics, setClinics]           = useState<any[]>([]);
  const [allDoctors, setAllDoctors]     = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);

  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editing, setEditing]         = useState<Appointment | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);

  // ── Load reference data once ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([patientsApi.getAll(), clinicsApi.getAll(), doctorsApi.getAll()])
      .then(([p, c, d]) => {
        setPatients(p.data);
        setClinics(c.data);
        setAllDoctors(d.data);
      })
      .catch(() => toast.error('Failed to load reference data'));
  }, []);

  // ── Load appointments ─────────────────────────────────────────────────────
  const loadAppointments = useCallback(() => {
    setLoading(true);
    appointmentsApi.getAll()
      .then(r => setAppointments(r.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // ── Filter doctors when clinic changes ────────────────────────────────────
  useEffect(() => {
    setFilteredDoctors(
      form.clinicId
        ? allDoctors.filter(d => {
            const cid = typeof d.clinicId === 'object' ? d.clinicId?._id : d.clinicId;
            return cid === form.clinicId;
          })
        : allDoctors,
    );
  }, [form.clinicId, allDoctors]);

  // ── Derived list (search + status filter) ────────────────────────────────
  const displayed = appointments.filter(a => {
    const matchSearch =
      !search ||
      (a.patientId?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.doctorId?.name  ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.clinicId?.name  ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Dialog helpers ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({
      patientId:  a.patientId?._id  ?? '',
      clinicId:   a.clinicId?._id   ?? '',
      doctorId:   a.doctorId?._id   ?? '',
      date:       a.date,
      time:       a.time,
      notes:      a.notes      ?? '',
      diagnosis:  a.diagnosis  ?? '',
      status:     a.status,
    });
    setDialogOpen(true);
  };

  // ── Save (create or update) ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.patientId || !form.doctorId || !form.clinicId || !form.date || !form.time) {
      toast.error(t('patientDoctorDepartmentDateTimeRequired'));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { data: updated } = await appointmentsApi.update(editing._id, form);
        setAppointments(prev => prev.map(a => a._id === editing._id ? updated : a));
        // If status changed to completed, create a visit record
        if (form.status === 'completed' && editing.status !== 'completed') {
          await maybeCreateVisit(updated);
        }
        toast.success(t('appointmentUpdated'));
      } else {
        const { data: created } = await appointmentsApi.create({
          patientId: form.patientId, doctorId: form.doctorId, clinicId: form.clinicId,
          date: form.date, time: form.time, notes: form.notes, diagnosis: form.diagnosis,
        });
        setAppointments(prev => [created, ...prev]);
        toast.success(t('appointmentCreated'));
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? t('failedSaveAppointment'));
    } finally {
      setSaving(false);
    }
  };

  // ── Quick status change from table ────────────────────────────────────────
  const handleStatusChange = async (a: Appointment, newStatus: AppointmentStatus) => {
    try {
      const { data: updated } = await appointmentsApi.update(a._id, { status: newStatus });
      setAppointments(prev => prev.map(x => x._id === a._id ? { ...x, status: newStatus } : x));
      if (newStatus === 'completed' && a.status !== 'completed') {
        await maybeCreateVisit(updated);
      }
      toast.success(`${t('statusChangedTo')} ${newStatus}`);
    } catch {
      toast.error(t('failedUpdateStatus'));
    }
  };

  // ── Soft delete ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await appointmentsApi.delete(deleteTarget._id);
      setAppointments(prev => prev.map(x => x._id === deleteTarget._id ? { ...x, status: 'deleted' as AppointmentStatus } : x));
      toast.success(t('appointmentDeleted'));
    } catch {
      toast.error(t('failedDeleteAppointment'));
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Auto-create visit when status → completed ─────────────────────────────
  const maybeCreateVisit = async (appt: any) => {
    try {
      const pid = appt.patientId?._id ?? appt.patientId;
      const did = appt.doctorId?._id  ?? appt.doctorId;
      await visitsApi.create({
        appointmentId: appt._id,
        patientId:     pid,
        doctorId:      did,
        date:          appt.date,
        notes:         appt.notes     ?? '',
        diagnosis:     appt.diagnosis ?? '',
      });
    } catch {
      // Visit creation is best-effort; don't block the UI
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">{t('appointmentsTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('appointmentsSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadAppointments} title={t('refresh')}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openCreate} className="gradient-primary border-0 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> {t('newAppointment')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t('searchAppointmentsPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">{t('allStatuses')}</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> {t('loadingAppointments')}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">{t('patient')}</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">{t('doctor')}</th>
                  <th className="text-left py-2 font-medium hidden lg:table-cell">{t('department')}</th>
                  <th className="text-left py-2 font-medium">{t('date')} & {t('time')}</th>
                  <th className="text-left py-2 font-medium">{t('status')}</th>
                  <th className="text-right py-2 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      {t('noAppointmentsFound')}
                    </td>
                  </tr>
                )}
                {displayed.map(a => (
                  <tr key={a._id} className={`border-b last:border-0 ${a.status === 'deleted' ? 'opacity-50' : ''}`}>
                    <td className="py-2.5 font-medium text-foreground">{a.patientId?.name ?? '—'}</td>
                    <td className="py-2.5 hidden md:table-cell text-muted-foreground">
                      <div>{a.doctorId?.name ?? '—'}</div>
                      <div className="text-xs text-primary">{a.doctorId?.specialization}</div>
                    </td>
                    <td className="py-2.5 hidden lg:table-cell text-muted-foreground">{a.clinicId?.name ?? '—'}</td>
                    <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                      <div>{a.date}</div>
                      <div className="text-xs">{a.time}</div>
                    </td>
                    <td className="py-2.5">
                      {/* Inline status dropdown */}
                      <select
                        value={a.status}
                        disabled={a.status === 'deleted'}
                        onChange={e => handleStatusChange(a, e.target.value as AppointmentStatus)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed ${STATUS_STYLES[a.status]}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 text-right space-x-1">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => openEdit(a)}
                        disabled={a.status === 'deleted'}
                        title={t('edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setDeleteTarget(a)}
                        disabled={a.status === 'deleted'}
                        className="text-destructive hover:text-destructive"
                        title={t('softDelete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? t('editAppointment') : t('newAppointment')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Patient */}
            <div>
              <Label>{t('patient')}</Label>
              <Select value={form.patientId} onValueChange={v => setForm(f => ({ ...f, patientId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('selectPatient')} /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <Label>{t('department')}</Label>
              <Select
                value={form.clinicId}
                onValueChange={v => setForm(f => ({ ...f, clinicId: v, doctorId: '' }))}
              >
                <SelectTrigger><SelectValue placeholder={t('selectDepartment')} /></SelectTrigger>
                <SelectContent>
                  {clinics.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor */}
            <div>
              <Label>{t('doctor')}</Label>
              <Select value={form.doctorId} onValueChange={v => setForm(f => ({ ...f, doctorId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('selectDoctor')} /></SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map(d => (
                    <SelectItem key={d._id} value={d._id}>{d.name} — {d.specialization}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('date')}</Label>
                <DatePicker
                  value={form.date}
                  onChange={v => setForm(f => ({ ...f, date: v }))}
                />
              </div>
              <div>
                <Label>{t('time')}</Label>
                <TimePicker
                  value={form.time}
                  onChange={v => setForm(f => ({ ...f, time: v }))}
                />
              </div>
            </div>

            {/* Status (edit only) */}
            {editing && (
              <div>
                <Label>{t('status')}</Label>
                <Select
                  value={form.status}
                  onValueChange={v => setForm(f => ({ ...f, status: v as AppointmentStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label>{t('notes')}</Label>
              <Textarea
                rows={3}
                placeholder={t('optionalNotes')}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            {/* Diagnosis */}
            <div>
              <Label>{t('diagnosis')}</Label>
              <Input
                placeholder={t('optionalDiagnosis')}
                value={form.diagnosis}
                onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gradient-primary border-0 text-primary-foreground"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? t('update') : t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemLabel={`appointment for ${deleteTarget?.patientId?.name ?? 'this patient'}`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminAppointments;
