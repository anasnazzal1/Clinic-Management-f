import { useState } from 'react';
import { receptionists as initialData, Receptionist } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const ReceptionistsManagement = () => {
  const [data, setData] = useState<Receptionist[]>([...initialData]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Receptionist | null>(null);
  const emptyForm = { name: '', phone: '', email: '', username: '', password: '' };
  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (r: Receptionist) => { setEditing(r); setForm({ name: r.name, phone: r.phone, email: r.email, username: '', password: '' }); setOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (editing) {
      setData(d => d.map(r => r.id === editing.id ? { ...r, name: form.name, phone: form.phone, email: form.email } : r));
      toast.success('Receptionist updated');
    } else {
      setData(d => [...d, { id: `r${Date.now()}`, name: form.name, phone: form.phone, email: form.email }]);
      toast.success('Receptionist added');
    }
    setOpen(false);
  };

  const handleDelete = (id: string) => { setData(d => d.filter(r => r.id !== id)); toast.success('Receptionist deleted'); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="font-display text-2xl font-bold text-foreground">Receptionists</h2><p className="text-sm text-muted-foreground">Manage front desk staff.</p></div>
        <Button onClick={openAdd} className="gradient-primary border-0 text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Receptionist</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">Name</th><th className="text-left py-2 font-medium">Phone</th><th className="text-left py-2 font-medium hidden md:table-cell">Email</th><th className="text-right py-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No receptionists found.</td></tr>}
              {filtered.map(r => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{r.name}</td>
                  <td className="py-2.5 text-muted-foreground">{r.phone}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{r.email}</td>
                  <td className="py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Receptionist</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
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

export default ReceptionistsManagement;
