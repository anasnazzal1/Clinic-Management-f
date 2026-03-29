import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PasswordInput = ({
  id, label, value, onChange, placeholder, error,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

const ChangePasswordPage = () => {
  const { logout } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.current) e.current = 'Current password is required.';
    if (!form.next) {
      e.next = 'New password is required.';
    } else if (form.next.length < 6) {
      e.next = 'New password must be at least 6 characters.';
    } else if (!/[a-zA-Z]/.test(form.next) || !/[0-9]/.test(form.next)) {
      e.next = 'New password must contain at least 1 letter and 1 number.';
    }
    if (!form.confirm) {
      e.confirm = 'Please confirm your new password.';
    } else if (form.next && form.confirm !== form.next) {
      e.confirm = 'Passwords do not match.';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await authApi.changePassword(form.current, form.next);
      setDone(true);
      toast.success('Password updated successfully. Please log in again.');
      setTimeout(() => logout(), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      if (msg.toLowerCase().includes('current')) {
        setErrors({ current: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const setField = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Change Password</h2>
          <p className="text-sm text-muted-foreground">Update your account password securely.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Password Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-success" />
                <p className="font-medium text-foreground">Password updated!</p>
                <p className="text-sm text-muted-foreground">Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordInput
                  id="current"
                  label="Current Password"
                  value={form.current}
                  onChange={v => setField('current', v)}
                  placeholder="Enter your current password"
                  error={errors.current}
                />

                <div className="border-t pt-4 space-y-4">
                  <PasswordInput
                    id="next"
                    label="New Password"
                    value={form.next}
                    onChange={v => setField('next', v)}
                    placeholder="min. 6 chars, letter + number"
                    error={errors.next}
                  />

                  {/* Strength bar */}
                  {form.next && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[
                          form.next.length >= 6,
                          /[A-Z]/.test(form.next),
                          /[0-9]/.test(form.next),
                          form.next.length >= 10,
                        ].map((met, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${met ? 'bg-success' : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength: {
                          [form.next.length >= 6, /[A-Z]/.test(form.next), /[0-9]/.test(form.next), form.next.length >= 10]
                            .filter(Boolean).length <= 1 ? 'Weak' :
                          [form.next.length >= 6, /[A-Z]/.test(form.next), /[0-9]/.test(form.next), form.next.length >= 10]
                            .filter(Boolean).length <= 2 ? 'Fair' :
                          [form.next.length >= 6, /[A-Z]/.test(form.next), /[0-9]/.test(form.next), form.next.length >= 10]
                            .filter(Boolean).length === 3 ? 'Good' : 'Strong'
                        }
                      </p>
                    </div>
                  )}

                  <PasswordInput
                    id="confirm"
                    label="Confirm New Password"
                    value={form.confirm}
                    onChange={v => setField('confirm', v)}
                    placeholder="Re-enter your new password"
                    error={errors.confirm}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-primary border-0 text-primary-foreground"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
