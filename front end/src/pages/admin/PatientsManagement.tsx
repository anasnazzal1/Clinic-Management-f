import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { patientsApi, usersApi } from '@/lib/api';
import { validateCredentials, hasCredentialErrors, type CredentialErrors } from '@/lib/validateCredentials';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import AvatarUpload from '@/components/AvatarUpload';
import Avatar from '@/components/Avatar';
import InlineAvatarUpload from '@/components/InlineAvatarUpload';
import { toast } from 'sonner';

const emptyForm = { name: '', age: '', gender: '', phone: '', email: '', address: '', username: '', password: '', linkedUserId: '', linkedUserImage: '' as string | undefined };

const PatientsManagement = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [credErrors, setCredErrors] = useState<CredentialErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  // patientId → { userId, profileImage }
  const [userMap, setUserMap] = useState<Record<string, { userId: string; image: string | null }>>({});

  const load = () => patientsApi.getAll(search || undefined).then(async r => {
    setData(r.data);
    const map: Record<string, { userId: string; image: string | null }> = {};
    await Promise.all(r.data.map(async (p: any) => {
      try {
        const { data: u } = await usersApi.getByLinkedId(p._id);
        if (u) map[p._id] = { userId: u._id, image: u.profileImage ?? p.profileImage ?? null };
        else if (p.profileImage) map[p._id] = { userId: p._id, image: p.profileImage };
      } catch { if (p.profileImage) map[p._id] = { userId: p._id, image: p.profileImage }; }
    }));
    setUserMap(map);
  }).catch(() => {});
  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setCredErrors({}); setOpen(true); };
  const openEdit = async (p: any) => {
    setEditing(p);
    setForm({ name: p.name, age: String(p.age || ''), gender: p.gender || '', phone: p.phone || '', email: p.email || '', address: p.address || '', username: '', password: '', linkedUserId: '', linkedUserImage: p.profileImage || undefined });
    setCredErrors({});
    setOpen(true);
    try {
      const { data: linkedUser } = await usersApi.getByLinkedId(p._id);
      if (linkedUser) setForm(f => ({ ...f, username: linkedUser.username, linkedUserId: linkedUser._id, linkedUserImage: linkedUser.profileImage || p.profileImage || undefined }));
    } catch { /* no linked user */ }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(t('nameRequired')); return; }

    if (!editing) {
      const errors = validateCredentials(form.username, form.password, true);
      setCredErrors(errors);
      if (hasCredentialErrors(errors)) return;
    } else if (form.linkedUserId && (form.username || form.password)) {
      const errors = validateCredentials(form.username, form.password, false);
      setCredErrors(errors);
      if (hasCredentialErrors(errors)) return;
    }

    const payload = { name: form.name, age: Number(form.age), gender: form.gender, phone: form.phone, email: form.email, address: form.address };
    try {
      if (editing) {
        const { data: updated } = await patientsApi.update(editing._id, payload);
        setData(d => d.map(p => p._id === editing._id ? updated : p));
        if (form.linkedUserId) {
          const userPatch: Record<string, string> = {};
          if (form.username) userPatch.username = form.username;
          if (form.password) userPatch.password = form.password;
          if (Object.keys(userPatch).length > 0) await usersApi.update(form.linkedUserId, userPatch);
        }
        toast.success(t('patientUpdated'));
      } else {
        const { data: result } = await patientsApi.create(
          { name: form.name, age: Number(form.age), gender: form.gender, phone: form.phone, email: form.email, address: form.address, username: form.username, password: form.password },
        );
        const created = result.patient ?? result;
        setData(d => [...d, created]);
        toast.success(t('patientAdded'));
      }
      setOpen(false);
    } catch (e: any) { toast.error(e.response?.data?.message || t('failedSavePatient')); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await patientsApi.delete(deleteTarget._id); setData(d => d.filter(p => p._id !== deleteTarget._id)); toast.success(t('patientDeleted')); }
    catch { toast.error(t('failedDeletePatient')); }
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
        <div><h2 className="font-display text-2xl font-bold text-foreground">{t('patientsTitle')}</h2><p className="text-sm text-muted-foreground">{t('patientsSubtitle')}</p></div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"><Plus className="w-4 h-4 mr-2" /> {t('addPatient')}</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder={t('searchPatientsPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card className="shadow-card">
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-muted-foreground"><th className="text-left py-2 font-medium">{t('patient')}</th><th className="text-left py-2 font-medium">{t('age')}</th><th className="text-left py-2 font-medium hidden md:table-cell">{t('gender')}</th><th className="text-left py-2 font-medium hidden md:table-cell">{t('phone')}</th><th className="text-right py-2 font-medium">{t('actions')}</th></tr></thead>
            <tbody>
              {data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">{t('noPatientsFound')}</td></tr>}
              {data.map(p => (
                <tr key={p._id} className="border-b last:border-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      {userMap[p._id] ? (
                        <InlineAvatarUpload
                          userId={userMap[p._id].userId}
                          currentImage={userMap[p._id].image}
                          name={p.name}
                          onUpdate={url => setUserMap(m => ({ ...m, [p._id]: { ...m[p._id], image: url } }))}
                        />
                      ) : (
                        <Avatar name={p.name} image={p.profileImage} size="xs" />
                      )}
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{p.age}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{p.gender}</td>
                  <td className="py-2.5 hidden md:table-cell text-muted-foreground">{p.phone}</td>
                  <td className="py-2.5 text-right space-x-1">
                    <Button variant="ghost" size="icon" title={t('viewProfile')} onClick={() => navigate(`/admin/patients/${p._id}`)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex flex-col max-h-[70vh] w-[90vw] sm:w-auto sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] shadow-lg rounded-lg">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-display">{editing ? t('update') : t('add')} {t('patient')}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 px-1 scroll-smooth">
            {editing && (
              <div className="flex justify-center pt-2">
                <AvatarUpload
                  userId={form.linkedUserId || editing._id}
                  currentImage={form.linkedUserImage}
                  name={form.name}
                  size="md"
                  onUpdate={url => setForm(f => ({ ...f, linkedUserImage: url ?? undefined }))}
                />
              </div>
            )}
            <div className="border-b pb-2">
              <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
            </div>
            <div><Label>{t('fullName')}</Label><Input value={form.name} onChange={e => setField('name', e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>{t('age')}</Label><Input type="number" value={form.age} onChange={e => setField('age', e.target.value)} /></div>
              <div><Label>{t('gender')} <span className="text-destructive">*</span></Label>
                <Select value={form.gender} onValueChange={v => setField('gender', v)}>
                  <SelectTrigger className={!form.gender && form.name ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">{t('male')}</SelectItem>
                    <SelectItem value="Female">{t('female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>{t('phone')}</Label><Input value={form.phone} onChange={e => setField('phone', e.target.value)} /></div>
              <div><Label>{t('email')}</Label><Input value={form.email} onChange={e => setField('email', e.target.value)} /></div>
            </div>
            <div><Label>{t('address')}</Label><Input value={form.address} onChange={e => setField('address', e.target.value)} /></div>

            {editing ? (
              <>
                <div className="border-t pt-3">
                  <h3 className="text-lg font-medium text-foreground mb-1">{t('accountInformation')}</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {form.linkedUserId ? t('usernamePrefilled') : t('noUserAccount')}
                  </p>
                </div>
                {form.linkedUserId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Username</Label>
                      <Input value={form.username} onChange={e => setField('username', e.target.value)} className={credErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''} />
                      {credErrors.username && <p className="text-xs text-destructive">{credErrors.username}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>New Password <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input type="password" value={form.password} onChange={e => setField('password', e.target.value)} placeholder={t('leaveEmpty')} className={credErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''} />
                      {credErrors.password && <p className="text-xs text-destructive">{credErrors.password}</p>}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="border-t pt-3">
                  <h3 className="text-lg font-medium text-foreground mb-1">{t('accountInformation')} <span className="text-destructive">*</span></h3>
                  <p className="text-xs text-muted-foreground mb-3">{t('requiredForPortal')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Username</Label>
                    <Input
                      value={form.username}
                      onChange={e => setField('username', e.target.value)}
                      className={credErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                      placeholder={t('usernamePlaceholder')}
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
                      placeholder={t('passwordPlaceholder')}
                    />
                    {credErrors.password && (
                      <p className="text-xs text-destructive">{credErrors.password}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex-shrink-0"><Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">{editing ? t('update') : t('add')}</Button></DialogFooter>
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

export default PatientsManagement;
