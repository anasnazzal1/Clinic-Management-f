import { useState, useEffect } from 'react';
import { doctorsApi, clinicsApi, usersApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { TimePicker } from '@/components/ui/time-picker';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseDays(str: string): string[] {
  if (!str) return [];
  const rangeMatch = str.match(/^(\w+)\s*-\s*(\w+)$/);
  if (rangeMatch) {
    const start = ALL_DAYS.indexOf(rangeMatch[1]);
    const end = ALL_DAYS.indexOf(rangeMatch[2]);
    if (start !== -1 && end !== -1) return ALL_DAYS.slice(start, end + 1);
  }
  return str.split(/[,\s]+/).map(s => s.trim()).filter(s => ALL_DAYS.includes(s));
}

function parseTime(str: string): string {
  if (!str) return '';
  const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return str.includes(':') ? str : '';
  let h = parseInt(m[1]);
  const min = m[2];
  const period = m[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

const DoctorsManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const emptyForm = { name: '', specialization: '', phone: '', email: '', clinicId: '', workingDays: [] as string[], startTime: '', endTime: '', username: '', password: '' };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    doctorsApi.getAll({ search: search || undefined }).then(r => setData(r.data)).catch(() => {});
    clinicsApi.getAll().then(r => setClinics(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (d: any) => {
    const [startRaw, endRaw] = (d.workingHours || '').split(' - ');
    setEditing(d);
    setForm({ name: d.name, specialization: d.specialization, phone: d.phone || '', email: d.email || '', clinicId: d.clinicId?._id || d.clinicId || '', workingDays: parseDays(d.workingDays || ''), startTime: parseTime(startRaw?.trim() || ''), endTime: parseTime(endRaw?.trim() || ''), username: '', password: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.specialization.trim()) { toast.error('Name and specialization are required'); return; }
    if (form.startTime && form.endTime && form.endTime <= form.startTime) { toast.error('End time must be after start time'); return; }
    const payload = { name: form.name, specialization: form.specialization, phone: form.phone, email: form.email, clinicId: form.clinicId || undefined, workingDays: form.workingDays.join(', '), workingHours: form.startTime && form.endTime ? `${form.startTime} - ${form.endTime}` : '' };
    try {
      if (editing) {
        const { data: updated } = await doctorsApi.update(editing._id, payload);
        setData(d => d.map(doc => doc._id === editing._id ? updated : doc));
        toast.success('Doctor updated');
      } else {
        const { data: created } = await doctorsApi.create(payload);
        if (form.username && form.password) {
          await usersApi.register({ username: form.username, password: form.password, role: 'doctor', name: form.name, email: form.email, linkedId: created._id });
        }
        setData(d => [...d, created]);
        toast.success('Doctor added');
      }
      setOpen(false);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save doctor'); }
  };

  const handleDelete = async (id: string) => {
    try { await doctorsApi.delete(id); setData(d => d.filter(doc => doc._id !== id)); toast.success('Doctor deleted'); }
    catch { toast.error('Failed to delete doctor'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="font-display text-2xl font-bold text-foreground">Doctors</h2><p className="text-sm text-muted-foreground">Manage doctor profiles and assignments.</p></div>
        <Button onClick={openAdd} className="gradient-primary border-0 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Doctor</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Name</th><th className="text-left py-2 font-medium">Specialization</th><th className="text-left py-2 font-medium hidden md:table-cell">Department</th><th className="text-left py-2 font-medium hidden lg:table-cell">Schedule</th><th className="text-right py-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No doctors found.</td></tr>}
              {data.map(d => (
                <tr key={d._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{d.name}</td>
                  <td className="py-2.5 text-primary font-medium">{d.specialization}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{d.clinicId?.name || '—'}</td>
                  <td className="py-2.5 hidden lg:table-cell text-muted-foreground">{d.workingDays} • {d.workingHours}</td>
                  <td className="py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(d._id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Doctor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.clinicId} onValueChange={v => setForm(f => ({ ...f, clinicId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{clinics.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {ALL_DAYS.map(day => (
                  <div key={day} className="flex items-center gap-1.5">
                    <Checkbox id={`day-${day}`} checked={form.workingDays.includes(day)} onCheckedChange={checked => setForm(f => ({ ...f, workingDays: checked ? [...f.workingDays, day] : f.workingDays.filter(d => d !== day) }))} />
                    <label htmlFor={`day-${day}`} className="text-sm cursor-pointer">{day}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Time</Label><TimePicker value={form.startTime} onChange={v => setForm(f => ({ ...f, startTime: v }))} placeholder="Start time" /></div>
              <div><Label>End Time</Label><TimePicker value={form.endTime} onChange={v => setForm(f => ({ ...f, endTime: v }))} placeholder="End time" minTime={form.startTime} /></div>
            </div>
            {!editing && (
              <>
                <div className="border-t pt-4"><p className="text-sm font-medium text-foreground mb-2">Login Credentials (optional)</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Username</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                  <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                </div>
              </>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave} className="gradient-primary border-0 text-primary-foreground">{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorsManagement;
