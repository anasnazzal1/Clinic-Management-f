import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clinicsApi, doctorsApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Clock, Stethoscope, ArrowRight,
  Heart, Search, X, Calendar, Mail, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Clinic {
  _id: string;
  name: string;
  workingHours: string;
  workingDays: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  clinicId: string | { _id: string; name: string };
  workingDays: string;
  workingHours: string;
}

const DoctorAvatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const initials = name.split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('');
  const sz = { sm: 'w-9 h-9 text-sm', md: 'w-14 h-14 text-lg', lg: 'w-20 h-20 text-2xl' }[size];
  return (
    <div className={`${sz} rounded-full gradient-primary flex items-center justify-center shrink-0`}>
      <span className="font-display font-bold text-primary-foreground">{initials}</span>
    </div>
  );
};

// Resolve clinicId whether it's a populated object or a raw string
const getClinicId = (doc: Doctor): string =>
  typeof doc.clinicId === 'object' && doc.clinicId !== null
    ? doc.clinicId._id
    : (doc.clinicId as string);

const Landing = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [expandedClinics, setExpandedClinics] = useState<Set<string>>(new Set());
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([clinicsApi.getAll(), doctorsApi.getAll()])
      .then(([cRes, dRes]) => {
        const fetchedClinics: Clinic[] = cRes.data;
        const fetchedDoctors: Doctor[] = dRes.data;
        setClinics(fetchedClinics);
        setDoctors(fetchedDoctors);
        // Expand all clinics by default
        setExpandedClinics(new Set(fetchedClinics.map(c => c._id)));
        setError('');
      })
      .catch(() => setError('Failed to load data. Please ensure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleClinic = (id: string) =>
    setExpandedClinics(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const specializations = useMemo(
    () => Array.from(new Set(doctors.map(d => d.specialization))).sort(),
    [doctors],
  );

  const filteredClinics = useMemo(() => {
    const q = search.toLowerCase();
    return clinics.map(clinic => {
      const clinicDoctors = doctors.filter(d => {
        if (getClinicId(d) !== clinic._id) return false;
        if (specFilter && d.specialization !== specFilter) return false;
        if (q) return (
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          clinic.name.toLowerCase().includes(q)
        );
        return true;
      });
      const clinicMatches = !q || clinic.name.toLowerCase().includes(q);
      return { clinic, clinicDoctors, visible: clinicMatches || clinicDoctors.length > 0 };
    }).filter(r => r.visible);
  }, [clinics, doctors, search, specFilter]);

  const selectedDoctorClinic = selectedDoctor
    ? clinics.find(c => c._id === getClinicId(selectedDoctor))
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">MediCare</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#clinics" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Departments</a>
            <a href="#doctors" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Doctors</a>
            <Link to="/login"><Button size="sm" className="gradient-primary border-0 text-primary-foreground">Sign In</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground/80 px-3 py-1 rounded-full text-xs font-medium mb-6">
              <Heart className="w-3 h-3" /> Trusted by 10,000+ patients
            </div>
            <h1 className="font-display text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your Health,<br />Our Priority
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-lg">
              One medical center, multiple specialties — compassionate doctors and seamless appointment management all under one roof.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" className="gradient-primary border-0 text-primary-foreground font-semibold">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#clinics">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  View Departments
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: loading ? '—' : String(clinics.length), label: 'Departments' },
            { value: loading ? '—' : String(doctors.length), label: 'Doctors' },
            { value: loading ? '—' : String(specializations.length), label: 'Specializations' },
            { value: '24/7', label: 'Emergency Care' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="font-display text-3xl font-extrabold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Search & Filter */}
      <section id="clinics" className="pt-16 pb-4">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-foreground mb-1">Our Departments & Doctors</h2>
            <p className="text-muted-foreground mb-8">Browse all specialties and the doctors working at our medical center.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search clinics or doctors..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={specFilter}
                onChange={e => setSpecFilter(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clinics + Doctors grouped */}
      <section id="doctors" className="py-10">
        <div className="container mx-auto px-4 space-y-8">

          {/* Loading state */}
          {loading && (
            <div className="py-24 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm">Loading departments and doctors...</span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="py-20 text-center">
              <p className="text-destructive font-medium mb-2">{error}</p>
              <p className="text-sm text-muted-foreground">Make sure the backend server is running on port 3000.</p>
            </div>
          )}

          {/* Empty state — no clinics at all */}
          {!loading && !error && clinics.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No departments available yet.</p>
              <p className="text-sm mt-1">An admin can add departments from the dashboard.</p>
            </div>
          )}

          {/* No search results */}
          {!loading && !error && clinics.length > 0 && filteredClinics.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">No results found. Try a different search.</div>
          )}

          {/* Clinic cards */}
          {!loading && !error && filteredClinics.map(({ clinic, clinicDoctors }, ci) => (
            <motion.div
              key={clinic._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.08 }}
            >
              <Card className="shadow-card overflow-hidden">
                {/* Clinic header — clickable to expand/collapse */}
                <button
                  className="w-full text-left"
                  onClick={() => toggleClinic(clinic._id)}
                  aria-expanded={expandedClinics.has(clinic._id)}
                >
                  <div className="flex items-start justify-between gap-4 p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-foreground leading-tight">{clinic.name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {clinic.workingDays} · {clinic.workingHours}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <Badge variant="secondary" className="text-xs">
                        {clinicDoctors.length} doctor{clinicDoctors.length !== 1 ? 's' : ''}
                      </Badge>
                      {expandedClinics.has(clinic._id)
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {/* Doctors grid */}
                <AnimatePresence initial={false}>
                  {expandedClinics.has(clinic._id) && (
                    <motion.div
                      key="doctors"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t px-5 py-4">
                        {clinicDoctors.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No doctors assigned to this department yet.
                          </p>
                        ) : (
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {clinicDoctors.map((doc, di) => (
                              <motion.button
                                key={doc._id}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: di * 0.05 }}
                                onClick={() => setSelectedDoctor(doc)}
                                className="group text-left rounded-xl border bg-card p-4 hover:shadow-elevated hover:border-primary/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <DoctorAvatar name={doc.name} size="sm" />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{doc.name}</p>
                                    <p className="text-xs text-primary font-medium truncate">{doc.specialization}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{doc.workingDays}</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Contact Us</h2>
          <p className="text-muted-foreground mb-6">Need assistance? Reach out anytime.</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> info@medicare.com</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 MediCare Clinic. All rights reserved.
        </div>
      </footer>

      {/* Doctor Detail Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={open => !open && setSelectedDoctor(null)}>
        <DialogContent className="max-w-sm">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display sr-only">Doctor Profile</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center text-center pt-2 pb-4 gap-3">
                <DoctorAvatar name={selectedDoctor.name} size="lg" />
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">{selectedDoctor.name}</h3>
                  <Badge className="mt-1 gradient-primary border-0 text-primary-foreground">{selectedDoctor.specialization}</Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedDoctor.workingDays} · {selectedDoctor.workingHours}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedDoctorClinic?.name ?? '—'} Department</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedDoctor.email}</span>
                </div>
              </div>
              <Link to="/login" className="block mt-4">
                <Button className="w-full gradient-primary border-0 text-primary-foreground">
                  Book Appointment <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;
