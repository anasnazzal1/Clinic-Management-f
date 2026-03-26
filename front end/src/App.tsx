import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ClinicsManagement from "./pages/admin/ClinicsManagement";
import DoctorsManagement from "./pages/admin/DoctorsManagement";
import PatientsManagement from "./pages/admin/PatientsManagement";
import PatientProfile from "./pages/admin/PatientProfile";
import ReceptionistsManagement from "./pages/admin/ReceptionistsManagement";
import AdminAppointments from "./pages/admin/AdminAppointments";

import { DoctorDashboard, DoctorAppointmentsPage } from "./pages/doctor/DoctorPages";
import { ReceptionistDashboard, AddPatientPage, BookAppointmentPage, ReceptionAppointmentsPage } from "./pages/receptionist/ReceptionistPages";
import { PatientDashboard, PatientAppointmentsPage, PatientHistoryPage } from "./pages/patient/PatientPages";
import React from "react";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user!.role)) return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/clinics" element={<ProtectedRoute allowedRoles={['admin']}><ClinicsManagement /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><DoctorsManagement /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><PatientsManagement /></ProtectedRoute>} />
            <Route path="/admin/patients/:id" element={<ProtectedRoute allowedRoles={['admin']}><PatientProfile /></ProtectedRoute>} />
            <Route path="/admin/receptionists" element={<ProtectedRoute allowedRoles={['admin']}><ReceptionistsManagement /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />

            {/* Doctor */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointmentsPage /></ProtectedRoute>} />

            {/* Receptionist */}
            <Route path="/reception" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
            <Route path="/reception/add-patient" element={<ProtectedRoute allowedRoles={['receptionist']}><AddPatientPage /></ProtectedRoute>} />
            <Route path="/reception/book" element={<ProtectedRoute allowedRoles={['receptionist']}><BookAppointmentPage /></ProtectedRoute>} />
            <Route path="/reception/appointments" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionAppointmentsPage /></ProtectedRoute>} />

            {/* Patient */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointmentsPage /></ProtectedRoute>} />
            <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><PatientHistoryPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
