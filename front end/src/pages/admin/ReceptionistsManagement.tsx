import { useState, useEffect } from 'react';
import { receptionistsApi, usersApi } from '@/lib/api';
import { validateCredentials, hasCredentialErrors, type CredentialErrors } from '@/lib/validateCredentials';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';

const emptyForm = { name: '', phone: '', email: '', username: '', password: '', linkedUserId: '' };

const ReceptionistsManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [credErrors, setCredErrors] = useState<CredentialErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const load = () => receptionistsApi.getAll(search || undefined).then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setCredErrors({}); setOpen(true); };
  const openEdit = async (r: any) => {
    setEditing(r);
    setForm({ name: r.name, phone: r.phone || '', email: r.email || '', username: '', password: '', linkedUserId: '' });
    setCredErrors({});
    setOpen(true);
    try {
      const { data: linkedUser } = await usersApi.getByLinkedId(r._id);
      if (linkedUser) setForm(f => ({ ...f, username: linkedUser.username, linkedUserId: linkedUser._id }));
    } catch { /* no linked user */ }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }

    if (!editing) {
      const errors = validateCredentials(form.username, form.password, true);
      setCredErrors(errors);
      if (hasCredentialErrors(errors)) return;
    } else if (form.linkedUserId && (form.username || form.password)) {
      const errors = validateCredentials(form.username, form.password, false);
      setCredErrors(errors);
      if (hasCredentialErrors(errors)) return;
    }

    const payload = { name: form.name, phone: form.phone, email: form.email };
    try {
      if (editing) {
        const { data: updated } = await receptionistsApi.update(editing._id, payload);
        setData(d => d.map(r => r._id === editing._id ? updated : r));
        if (form.linkedUserId) {
          const userPatch: Record<string, string> = {};
          if (form.username) userPatch.username = form.username;
          if (form.password) userPatch.password = form.password;
          if (Object.keys(userPatch).length > 0) await usersApi.update(form.linkedUserId, userPatch);
        }
        toast.success('Receptionist updated');
      } else {
        const { data: created } = await receptionistsApi.create(payload);
        await usersApi.register({ username: form.username, password: form.password, role: 'receptionist', name: form.name, email: form.email, linkedId: created._id });
        setData(d => [...d, created]);
        toast.success('Receptionist added');
      }
      setOpen(false);
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save receptionist'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await receptionistsApi.delete(deleteTarget._id); setData(d => d.filter(r => r._id !== deleteTarget._id)); toast.success('Receptionist deleted'); }
    catch { toast.error('Failed to delete receptionist'); }
    finally { setDeleteTarget(null); }
  };

  const setField = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (key === 'username' || key === 'password') {
      setCredErrors(e => ({ ...e, [key]: undefined }));
    }
  };

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
              {data.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No receptionists found.</td></tr>}
              {data.map(r => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-2.5 font-medium text-foreground">{r.name}</td>
                  <td className="py-2.5 text-muted-foreground">{r.phone}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{r.email}</td>
                  <td className="py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(r)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
            <div><Label>Full Name</Label><Input value={form.name} onChange={e => setField('name', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setField('email', e.target.value)} /></div>
            </div>

            {editing ? (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">Login Credentials</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {form.linkedUserId ? 'Username is pre-filled. Leave password empty to keep it unchanged.' : 'No user account linked to this receptionist yet.'}
                  </p>
                </div>
                {form.linkedUserId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Username</Label>
                      <Input value={form.username} onChange={e => setField('username', e.target.value)} className={credErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''} />
                      {credErrors.username && <p className="text-xs text-destructive">{credErrors.username}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>New Password <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input type="password" value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Leave empty to keep current" className={credErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''} />
                      {credErrors.password && <p className="text-xs text-destructive">{credErrors.password}</p>}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">Login Credentials <span className="text-destructive">*</span></p>
                  <p className="text-xs text-muted-foreground mb-3">Required to give the receptionist access to the portal.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Username</Label>
                    <Input
                      value={form.username}
                      onChange={e => setField('username', e.target.value)}
                      className={credErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                      placeholder="min. 4 chars, no spaces"
                    />
                    {credErrors.username && (
                      <p className="text-xs text-destructive">{credErrors.username}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={e => setField('password', e.target.value)}
                      className={credErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
                      placeholder="min. 6 chars, letter + number"
                    />
                    {credErrors.password && (
                      <p className="text-xs text-destructive">{credErrors.password}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave} className="gradient-primary border-0 text-primary-foreground">{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemLabel={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ReceptionistsManagement;
