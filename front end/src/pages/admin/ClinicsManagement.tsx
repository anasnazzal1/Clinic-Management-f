import { useState, useEffect } from 'react';
import { clinicsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { TimePicker } from '@/components/ui/time-picker';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

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

const ClinicsManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const emptyForm = { name: '', workingDays: [] as string[], startTime: '', endTime: '' };
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const load = () => clinicsApi.getAll(search || undefined).then(r => setData(r.data)).catch(() => {});

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (c: any) => {
    const [startRaw, endRaw] = (c.workingHours || '').split(' - ');
    setEditing(c);
    setForm({ name: c.name, workingDays: parseDays(c.workingDays || ''), startTime: parseTime(startRaw?.trim() || ''), endTime: parseTime(endRaw?.trim() || '') });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    if (form.startTime && form.endTime && form.endTime <= form.startTime) { toast.error('End time must be after start time'); return; }
    const payload = {
      name: form.name,
      workingDays: form.workingDays.join(', '),
      workingHours: form.startTime && form.endTime ? `${form.startTime} - ${form.endTime}` : '',
    };
    try {
      if (editing) {
        const { data: updated } = await clinicsApi.update(editing._id, payload);
        setData(d => d.map(c => c._id === editing._id ? updated : c));
        toast.success('Department updated');
      } else {
        const { data: created } = await clinicsApi.create(payload);
        setData(d => [...d, created]);
        toast.success('Department added');
      }
      setOpen(false);
    } catch { toast.error('Failed to save department'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await clinicsApi.delete(deleteTarget._id);
      setData(d => d.filter(c => c._id !== deleteTarget._id));
      toast.success('Department deleted');
    } catch { toast.error('Failed to delete department'); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Departments</h2>
          <p className="text-sm text-muted-foreground">Manage specialties and departments within the medical center.</p>
        </div>
        <Button onClick={openAdd} className="gradient-primary border-0 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Department / Specialty</th><th className="text-left py-2 font-medium hidden md:table-cell">Working Days</th><th className="text-left py-2 font-medium hidden lg:table-cell">Hours</th><th className="text-right py-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No departments found.</td></tr>}
              {data.map(c => (
                <tr key={c._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{c.name}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{c.workingDays}</td>
                  <td className="py-2.5 hidden lg:table-cell text-muted-foreground">{c.workingHours}</td>
                  <td className="py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Department</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Department / Specialty Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cardiology" /></div>
            <div>
              <Label>Working Days</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {ALL_DAYS.map(day => (
                  <div key={day} className="flex items-center gap-1.5">
                    <Checkbox id={`clinic-day-${day}`} checked={form.workingDays.includes(day)} onCheckedChange={checked => setForm(f => ({ ...f, workingDays: checked ? [...f.workingDays, day] : f.workingDays.filter(d => d !== day) }))} />
                    <label htmlFor={`clinic-day-${day}`} className="text-sm cursor-pointer">{day}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Time</Label><TimePicker value={form.startTime} onChange={v => setForm(f => ({ ...f, startTime: v }))} placeholder="Start time" /></div>
              <div><Label>End Time</Label><TimePicker value={form.endTime} onChange={v => setForm(f => ({ ...f, endTime: v }))} placeholder="End time" minTime={form.startTime} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="gradient-primary border-0 text-primary-foreground">{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemLabel={`the ${deleteTarget?.name} department`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ClinicsManagement;
