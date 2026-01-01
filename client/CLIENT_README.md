# ClinicHub Frontend

Modern React-based frontend for the ClinicHub Healthcare Management System.

## 🚀 Features

- **Authentication**: Secure login and registration with role-based access
- **Dashboard**: Overview of appointments and clinic statistics
- **Appointment Management**: Create, view, update, and cancel appointments with real-time updates
- **Patient Records**: View patient medical summaries, medications, and allergies
- **Visit Reports**: Access and download post-visit medical reports as PDFs
- **Analytics**: Comprehensive analytics dashboard for doctors and admins
- **Real-Time Updates**: WebSocket integration for instant appointment notifications
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **date-fns** - Date utility library
- **React Hot Toast** - Toast notifications

## 📋 Prerequisites

- Node.js v18 or higher
- Backend API running on `http://localhost:6000`

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
client/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable components
│   │   ├── Layout.jsx
│   │   └── AppointmentModal.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Appointments.jsx
│   │   ├── Patients.jsx
│   │   ├── PatientDetails.jsx
│   │   ├── VisitReports.jsx
│   │   ├── Analytics.jsx
│   │   └── Profile.jsx
│   ├── services/       # API and Socket services
│   │   ├── api.js
│   │   └── socket.js
│   ├── store/          # State management
│   │   └── authStore.js
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js      # Vite configuration with proxy
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md
```

## 🔑 User Roles

### Patient

- View and manage own appointments
- View own profile
- Access personal medical records

### Doctor

- View and manage all appointments
- Access patient medical summaries
- Create and view visit reports
- Access analytics dashboard

### Admin

- All doctor permissions
- Access to comprehensive analytics
- Full system management

## 🎨 Key Features Explained

### Authentication

- JWT token-based authentication
- Persistent login state using Zustand with localStorage
- Protected routes based on user role
- Automatic token refresh and logout on expiration

### Real-Time Updates

- Socket.IO integration for instant notifications
- Real-time appointment status updates
- Live dashboard refresh on new appointments

### Responsive Design

- Mobile-first approach
- Collapsible sidebar navigation
- Touch-friendly UI elements
- Optimized for all screen sizes

### API Integration

- Axios interceptors for auth tokens
- Centralized error handling
- Loading states for better UX
- Toast notifications for user feedback

## 📝 License

This project is part of the ClinicHub Healthcare Management System.

---

For backend documentation, see the main README.md in the project root.
