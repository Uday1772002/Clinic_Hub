# ClinicHub - Healthcare Management System

A comprehensive healthcare management application that enables clinic administrators, doctors, and patients to manage appointments, patient records, and medical summaries with real-time updates.

## 🚀 Features

### Core Functionality

- **Role-Based Authentication**: JWT-based authentication with three roles (Admin, Doctor, Patient)
- **Appointment Management**: Schedule, view, update, and cancel appointments
- **Patient Medical Summaries**: Maintain comprehensive patient medical records
- **Real-Time Updates**: WebSocket integration for instant appointment status updates
- **Analytics Dashboard**: Generate insights on patient visits and appointment patterns
- **Post-Visit Reports**: Create and download detailed medical visit reports as PDF
- **Email Notifications**: Automated email notifications for appointment events
- **Audit Logging**: Track all changes to appointments and patient data

### Security Features

- Secure password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Rate limiting to prevent abuse
- Helmet.js for security headers
- Input validation and sanitization

### Additional Features

- Comprehensive API documentation with Swagger
- Winston logging for application monitoring
- Docker containerization for easy deployment
- Unit tests for critical endpoints
- MongoDB with Mongoose ODM

## 🎨 Frontend Application

A modern React-based user interface is now available in the `client/` directory!

### Frontend Features:

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-Time Updates**: Instant notifications using WebSocket integration
- **Role-Based UI**: Different interfaces for patients, doctors, and admins
- **Modern UI/UX**: Built with React, Tailwind CSS, and Lucide icons
- **State Management**: Efficient state handling with Zustand
- **Toast Notifications**: User-friendly feedback for all actions

### Quick Start (Full Stack):

1. **Start the backend** (from project root):

   ```bash
   npm run dev
   ```

2. **Start the frontend** (in a new terminal):

   ```bash
   cd client
   npm install --legacy-peer-deps
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:6000
   - API Docs: http://localhost:6000/api-docs

For detailed frontend documentation, see [client/CLIENT_README.md](client/CLIENT_README.md)
For a quick start guide, see [QUICKSTART.md](QUICKSTART.md)

## 📋 Requirements

- Node.js v18 or higher
- MongoDB v7.0 or higher
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Method 1: Local Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd ClinicHub
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=6000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=your_admin_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@clinichub.com
```

4. **Start the application**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Method 2: Docker Setup

1. **Build and run with Docker Compose**

```bash
docker-compose up -d
```

This will start:

- MongoDB database on port 27017
- ClinicHub API on port 6000
- MongoDB Express (database UI) on port 8081

2. **View logs**

```bash
docker-compose logs -f clinichub-app
```

3. **Stop services**

```bash
docker-compose down
```

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:6000/api-docs
- **API Spec JSON**: http://localhost:6000/api-docs.json

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Appointments

- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Patient Summaries

- `GET /api/patients/:patientId/summary` - Get patient summary
- `PUT /api/patients/:patientId/summary` - Update patient summary
- `POST /api/patients/:patientId/summary/medications` - Add medication
- `POST /api/patients/:patientId/summary/allergies` - Add allergy

### Visit Reports

- `POST /api/visit-reports` - Create visit report
- `GET /api/visit-reports` - Get all visit reports
- `GET /api/visit-reports/:id` - Get visit report by ID
- `GET /api/visit-reports/:id/download` - Download report as PDF
- `PUT /api/visit-reports/:id` - Update visit report

### Analytics

- `GET /api/analytics/appointments` - Get appointment analytics
- `GET /api/analytics/patients` - Get patient analytics
- `GET /api/analytics/doctors/:doctorId` - Get doctor performance metrics

## 🧪 Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## 🔌 WebSocket Events

### Incoming Events

- `connection` - Establishes WebSocket connection
- `join_room` - Join a specific room
- `leave_room` - Leave a room
- `request_appointment_status` - Request appointment status update

### Server Events

- `connected` - Connection confirmation
- `new_appointment` - New appointment created (to doctor)
- `appointment_update` - Appointment status updated
- `appointment_cancelled` - Appointment cancelled

**Note:** WebSocket connections require JWT token authentication via `auth.token` parameter.

## 👥 User Roles

### Admin

- Manage all appointments
- View analytics and reports
- Create appointments for patients
- Update patient summaries
- Access all system features

### Doctor

- View their appointments
- Update appointment status
- Add notes to appointments
- Create and manage visit reports
- Update patient medical summaries
- View their performance metrics

### Patient

- Create appointments
- View their appointments
- View their medical summary
- Cancel their appointments
- Receive real-time updates

## 📧 Email Notifications

Email notifications are sent for:

- New appointment scheduled
- Appointment status updated
- Appointment cancelled

Configure SMTP settings in `.env` file to enable email notifications.

## 📝 Logging

The application uses Winston for logging with the following features:

- Separate log files for errors and combined logs
- Rotating log files (5MB max size, 5 files retained)
- Console output in development mode
- Structured JSON logging

Log files are stored in the `logs/` directory:

- `combined.log` - All logs
- `error.log` - Error logs only

## 🔒 Security Best Practices

1. **Authentication**: All sensitive endpoints require JWT authentication
2. **Authorization**: Role-based access control for different user types
3. **Rate Limiting**: API rate limiting to prevent abuse
4. **Password Security**: Passwords hashed with bcrypt (12 rounds)
5. **Input Validation**: All inputs validated using validators
6. **Audit Logging**: All critical operations are logged with user info

## 🏗️ Project Structure

```
ClinicHub/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   ├── socket.js          # WebSocket configuration
│   │   └── swagger.js         # API documentation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   ├── patientController.js
│   │   ├── visitReportController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js            # Authentication & authorization
│   │   ├── errorHandler.js    # Global error handler
│   │   └── rateLimiter.js     # Rate limiting
│   ├── models/
│   │   ├── user.js
│   │   ├── appointment.js
│   │   ├── patientSummary.js
│   │   ├── visitReport.js
│   │   └── auditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── visitReportRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   ├── jwt.js             # JWT utilities
│   │   ├── logger.js          # Winston logger
│   │   ├── email.js           # Email notifications
│   │   └── auditLogger.js     # Audit logging
│   └── app.js                 # Application entry point
├── __tests__/                 # Unit tests
├── logs/                      # Application logs
├── .env                       # Environment variables
├── .env.example               # Example environment variables
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package.json
└── README.md
```

## 🚢 Deployment

### Docker Deployment

1. Build the image:

```bash
docker build -t clinichub:latest .
```

2. Run with docker-compose:

```bash
docker-compose up -d
```

### Manual Deployment

1. Set NODE_ENV to production
2. Configure production MongoDB URI
3. Set strong JWT_SECRET
4. Configure email SMTP settings
5. Run: `npm start`

## 📊 Database Schema

### Users Collection

- Stores admin, doctor, and patient information
- Includes authentication credentials
- Role-based fields (specialization for doctors)

### Appointments Collection

- Links patients with doctors
- Tracks appointment status
- Includes cancellation tracking

### Patient Summaries Collection

- Medical history and allergies
- Current medications
- Chronic conditions
- Emergency contacts

### Visit Reports Collection

- Post-appointment medical reports
- Diagnosis and prescriptions
- Vital signs
- Follow-up information

### Audit Logs Collection

- Tracks all critical operations
- Records user actions
- IP address and timestamp logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC License

## 👨‍💻 Author

Jayaram Uday

## 🆘 Support

For support, email support@clinichub.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release
  - Complete authentication system
  - Appointment management
  - Patient summaries
  - Visit reports with PDF generation
  - Real-time WebSocket updates
  - Analytics dashboard
  - Email notifications
  - Audit logging
  - Docker support
  - Comprehensive API documentation

## 📝 API Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "1234567890",
  "role": "patient"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Appointment

```bash
POST /api/appointments
Cookie: token=<your_jwt_token>
Content-Type: application/json

{
  "doctorId": "doctor_id_here",
  "appointmentDate": "2024-12-25",
  "appointmentTime": "10:00",
  "duration": 30,
  "reason": "Regular checkup"
}

Response:
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "_id": "...",
      "patient": {...},
      "doctor": {...},
      "appointmentDate": "2024-12-25",
      "appointmentTime": "10:00",
      "status": "scheduled",
      "reason": "Regular checkup"
    }
  }
}
```

### Get Analytics

```bash
GET /api/analytics/appointments?startDate=2024-01-01&endDate=2024-12-31
Cookie: token=<your_jwt_token>

Response:
{
  "success": true,
  "data": {
    "statusBreakdown": [...],
    "appointmentsPerDoctor": [...],
    "dailyTrends": [...],
    "peakHours": [...],
    "commonReasons": [...]
  }
}
```

## ⚡ Performance Tips

1. **Database Indexing**: All frequently queried fields are indexed
2. **Connection Pooling**: MongoDB connection pooling is enabled
3. **Rate Limiting**: Prevents API abuse and ensures fair usage
4. **Logging**: Asynchronous logging for better performance
5. **Caching**: Consider adding Redis for session management in production

## 🎯 Future Enhancements

- [ ] SMS notifications
- [ ] Video consultation integration
- [ ] Prescription management system
- [ ] Laboratory test result tracking
- [ ] Insurance claim management
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced analytics with charts
- [ ] Patient portal with health records
- [ ] Automated appointment reminders

---

**Built with ❤️ for better healthcare management**

## ✏️ Daily polish log

- 2026-01-21: Added minor readability tweaks and UI copy notes for ongoing reviews.
- 2026-01-22: Logged UI microcopy pass and navigation accessibility review.
- 2026-01-23: Recorded live dashboard copy updates and filter clarity notes.
- 2026-01-24: Noted socket configuration reminder and final UI microcopy sweep.
