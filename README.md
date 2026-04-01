# Clinic Management System

A comprehensive full-stack web application designed to streamline clinic operations by managing patients, doctors, appointments, and medical records efficiently.

## Description

The Clinic Management System is a modern web-based platform that digitizes and simplifies healthcare administration. It provides role-based access for different users including administrators, doctors, receptionists, and patients, enabling seamless coordination between all stakeholders in a medical facility.

## Features

### Admin Dashboard
- **User Management**: Create, update, and manage doctors, patients, and receptionists
- **Department Management**: Organize and maintain clinic departments
- **Profile Management**: Upload and manage user profile images
- **Full CRUD Operations**: Complete control over all system entities
- **System Overview**: View statistics and system-wide insights

### Doctor Dashboard
- **Patient Management**: View assigned patients and their medical history
- **Appointment Handling**: Mark appointments as completed or canceled
- **Medical Records**: Add diagnosis notes and visit records
- **Schedule Management**: View and manage appointment schedules

### Reception Dashboard
- **Patient Registration**: Add new patients to the system
- **Appointment Booking**: Schedule appointments for patients
- **Patient Search**: Quickly find and access patient information

### Patient Dashboard
- **Profile Access**: View and update personal information
- **Appointment Tracking**: View upcoming and past appointments
- **Medical History**: Access personal medical records and visit notes

### Authentication & Security
- **Role-Based Access Control**: Different permissions for Admin, Doctor, Receptionist, and Patient roles
- **Secure Login System**: JWT-based authentication
- **Protected Routes**: Route-level security based on user roles
- **Session Management**: Persistent login with automatic logout on token expiry

## Tech Stack

### Frontend
- **React** - Component-based UI library
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Token for authentication

### Additional Libraries
- **Mongoose** - MongoDB object modeling
- **bcrypt** - Password hashing
- **Axios** - HTTP client
- **React Router** - Client-side routing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clinic-management-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../front-end
   npm install
   ```

## Running the Project

### Backend
```bash
cd backend
npm install
npm run seed  # Populate database with demo data
npm run start:dev  # Start development server
```

### Frontend
```bash
cd "front end"
npm install
npm run dev  # Start development server
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/clinic
JWT_SECRET=your-super-secret-jwt-key-here
```

## Demo Credentials

After running the seed script, use these credentials to test the application:

- **Admin**: `admin` / `admin123`
- **Doctors**: `dr.sarah` / `doctor123`, `dr.james` / `doctor123`, etc.
- **Receptionists**: `nancy` / `recep123`, `tom` / `recep123`
- **Patients**: `alice` / `patient123`, `bob` / `patient123`, etc.

## Screenshots

*Coming soon - Screenshots of the application interface will be added here.*

## Future Improvements

- **Real-time Notifications**: Push notifications for appointment reminders
- **Reporting System**: Generate reports on clinic performance and patient statistics
- **Email Integration**: Automated email notifications for appointments
- **Mobile App**: Native mobile application for patients and doctors
- **Advanced Analytics**: Detailed insights and data visualization
- **Multi-language Support**: Internationalization for different regions
- **Backup & Recovery**: Automated database backups and recovery options

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Developer Name**  
*Contact information and links*

---

*Built with ❤️ for efficient healthcare management*