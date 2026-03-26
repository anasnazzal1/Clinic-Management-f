import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getRolePath } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, password);
    if (success) {
      const stored = JSON.parse(localStorage.getItem('clinicUser')!);
      navigate(getRolePath(stored.role));
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        aria-label="Back to home"
        className="fixed top-4 left-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-background/60 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your MediCare account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
              </div>
              <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials — click to auto-fill</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {[
                  { label: 'Admin', u: 'admin', p: 'admin123' },
                  { label: 'Doctor', u: 'dr.sarah', p: 'doctor123' },
                  { label: 'Reception', u: 'nancy', p: 'recep123' },
                  { label: 'Patient', u: 'alice', p: 'patient123' },
                ].map(cred => (
                  <button
                    key={cred.label}
                    type="button"
                    className="bg-muted rounded-md p-2 text-left hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => { setUsername(cred.u); setPassword(cred.p); setError(''); }}
                  >
                    <span className="font-medium text-foreground">{cred.label}:</span> {cred.u} / {cred.p}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
