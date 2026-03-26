import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('clinicUser');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
};

// Clinics
export const clinicsApi = {
  getAll: (search?: string) => api.get('/clinics', { params: { search } }),
  create: (data: any) => api.post('/clinics', data),
  update: (id: string, data: any) => api.put(`/clinics/${id}`, data),
  delete: (id: string) => api.delete(`/clinics/${id}`),
};

// Doctors
export const doctorsApi = {
  getAll: (params?: { clinicId?: string; search?: string }) => api.get('/doctors', { params }),
  create: (data: any) => api.post('/doctors', data),
  update: (id: string, data: any) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
};

// Patients
export const patientsApi = {
  getAll: (search?: string) => api.get('/patients', { params: { search } }),
  getOne: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
};

// Receptionists
export const receptionistsApi = {
  getAll: (search?: string) => api.get('/receptionists', { params: { search } }),
  create: (data: any) => api.post('/receptionists', data),
  update: (id: string, data: any) => api.put(`/receptionists/${id}`, data),
  delete: (id: string) => api.delete(`/receptionists/${id}`),
};

// Appointments
export const appointmentsApi = {
  getAll: (params?: { doctorId?: string; patientId?: string; status?: string }) => api.get('/appointments', { params }),
  getOne: (id: string) => api.get(`/appointments/${id}`),
  create: (data: any) => api.post('/appointments', data),
  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// Visits
export const visitsApi = {
  getAll: (params?: { patientId?: string; doctorId?: string }) => api.get('/visits', { params }),
  create: (data: any) => api.post('/visits', data),
};

// Users (admin)
export const usersApi = {
  getAll: (role?: string) => api.get('/users', { params: { role } }),
  getByLinkedId: (linkedId: string) => api.get(`/users/by-linked/${linkedId}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  register: (data: any) => api.post('/auth/register', data),
};
