# Clinic Management System — Backend

## Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or update `.env`)

## Setup

```bash
# Install dependencies
npm install

# Seed the database with demo data
npm run seed

# Start development server
npm run start:dev
```

The API runs at: `http://localhost:3000/api`

## Demo Credentials (after seeding)
| Role         | Username  | Password    |
|--------------|-----------|-------------|
| Admin        | admin     | admin123    |
| Doctor       | dr.sarah  | doctor123   |
| Receptionist | nancy     | recep123    |
| Patient      | alice     | patient123  |

## API Endpoints

| Method | Path                    | Access                    |
|--------|-------------------------|---------------------------|
| POST   | /auth/login             | Public                    |
| POST   | /auth/register          | Admin                     |
| GET    | /clinics                | Public                    |
| POST   | /clinics                | Admin                     |
| PUT    | /clinics/:id            | Admin                     |
| DELETE | /clinics/:id            | Admin                     |
| GET    | /doctors                | Public (filter: clinicId) |
| POST   | /doctors                | Admin                     |
| PUT    | /doctors/:id            | Admin                     |
| DELETE | /doctors/:id            | Admin                     |
| GET    | /patients               | Admin, Receptionist, Doctor |
| GET    | /patients/:id           | All roles (patient: self only) |
| POST   | /patients               | Admin, Receptionist       |
| PUT    | /patients/:id           | Admin, Receptionist       |
| DELETE | /patients/:id           | Admin, Receptionist       |
| GET    | /receptionists          | Admin                     |
| POST   | /receptionists          | Admin                     |
| PUT    | /receptionists/:id      | Admin                     |
| DELETE | /receptionists/:id      | Admin                     |
| GET    | /appointments           | All roles (scoped by role)|
| POST   | /appointments           | Admin, Receptionist       |
| PUT    | /appointments/:id       | Admin, Doctor, Receptionist |
| DELETE | /appointments/:id       | Admin                     |
| GET    | /visits                 | Admin, Doctor, Patient    |
| POST   | /visits                 | Doctor                    |
| GET    | /users                  | Admin                     |
| POST   | /users                  | Admin                     |
| PUT    | /users/:id              | Admin                     |
| DELETE | /users/:id              | Admin                     |
