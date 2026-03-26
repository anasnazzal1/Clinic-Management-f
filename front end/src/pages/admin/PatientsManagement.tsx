import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientsApi, usersApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

const PatientsManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const emptyForm = { name: '', age: '', gender: '', phone: '', email: '', address: '', username: '', password: '' };
  const [form, setForm] = useState(emptyForm);

  const load = () => patientsApi.getAll(search || undefined).then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name, age: String(p.age || ''), gender: p.gender || '', phone: p.phone || '', email: p.email || '', address: p.address || '', username: '', password: '' }); setOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const payload = { name: form.name, age: Number(form.age), gender: form.gender, phone: form.phone, email: form.email, address: form.address };
    try {
      if (editing) {
        const { data: updated } = await patientsApi.update(editing._id, payload);
        setData(d => d.map(p => p._id === editing._id ? updated : p));
        toast.success('Patient updated');
      } else {
        const { data: created } = await patientsApi.create(payload);
        if (form.username && form.password) {
          await usersApi.register({ username: form.username, password: form.password, role: 'patient', name: form.name, email: form.email, linkedId: created._id });
        }
        setData(d => [...d, created]);
        toast.success('Patient added');
      }
      setOpen(false);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save patient'); }
  };

  const handleDelete = async (id: string) => {
    try { await patientsApi.delete(id); setData(d => d.filter(p => p._id !== id)); toast.success('Patient deleted'); }
    catch { toast.error('Failed to delete patient'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="font-display text-2xl font-bold text-foreground">Patients</h2><p className="text-sm text-muted-foreground">Manage patient records.</p></div>
        <Button onClick={openAdd} className="gradient-primary border-0 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Patient</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Name</th><th className="text-left py-2 font-medium">Age</th><th className="text-left py-2 font-medium hidden md:table-cell">Gender</th><th className="text-left py-2 font-medium hidden md:table-cell">Phone</th><th className="text-right py-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No patients found.</td></tr>}
              {data.map(p => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{p.name}</td>
                  <td className="py-2.5 text-muted-foreground">{p.age}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{p.gender}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{p.phone}</td>
                  <td className="py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" title="View Profile" onClick={() => navigate(`/admin/patients/${p._id}`)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Patient</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} /></div>
              <div><Label>Gender</Label><Input value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} placeholder="Male / Female" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            {!editing && (
              <>
                <div className="border-t pt-4"><p className="text-sm font-medium text-foreground mb-2">Login Credentials</p></div>
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

export default PatientsManagement;
