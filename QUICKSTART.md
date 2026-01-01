# 🏥 ClinicHub - Frontend & Backend Quick Start Guide

## 🚀 Running the Complete Application

### Step 1: Start the Backend Server

```bash
# From the project root
npm run dev
```

The backend will start on: **http://localhost:6000**

- API Documentation: **http://localhost:6000/api-docs**

### Step 2: Start the Frontend Development Server

```bash
# Open a new terminal and run
cd client
npm run dev
```

The frontend will start on: **http://localhost:3000**

### Step 3: Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

## 👥 Test Accounts

You can register new accounts or use these test credentials (if you've seeded the database):

### Patient Account

- Email: `patient@test.com`
- Password: `password123`

### Doctor Account

- Email: `doctor@test.com`
- Password: `password123`

### Admin Account

- Email: `admin@test.com`
- Password: `password123`

---

## 📱 Application Features

### For Patients:

1. **Login/Register** - Create account or sign in
2. **Dashboard** - View upcoming appointments
3. **Appointments** - Book, view, and manage appointments
4. **Profile** - Update personal information

### For Doctors:

1. All patient features +
2. **Patient Records** - Access patient medical summaries
3. **Visit Reports** - Create and download visit reports as PDF
4. **Analytics** - View clinic statistics and trends

### For Admins:

1. All doctor features +
2. **Advanced Analytics** - Comprehensive clinic insights
3. **Full System Access** - Manage all aspects of the clinic

---

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Instant notifications via WebSocket
- **Dark Mode Support** - Coming soon
- **Toast Notifications** - User-friendly feedback
- **Loading States** - Clear indication of processing
- **Error Handling** - Graceful error messages

---

## 🛠️ Technology Stack

### Backend:

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO for real-time updates
- PDFKit for report generation
- Nodemailer for email notifications

### Frontend:

- React 18 + Vite
- React Router for navigation
- Zustand for state management
- Tailwind CSS for styling
- Axios for API calls
- Socket.IO Client for real-time
- Lucide Icons

---

## 📂 Project Structure

```
ClinicHub/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & Socket services
│   │   ├── store/         # State management
│   │   └── App.jsx        # Main app with routing
│   └── package.json
├── src/                   # Backend Node.js application
│   ├── controllers/       # Request handlers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, error handling
│   ├── config/           # Database, socket, swagger
│   └── utils/            # Helper functions
├── __tests__/            # Test files
├── docker-compose.yml    # Docker configuration
└── package.json          # Backend dependencies
```

---

## 🐛 Troubleshooting

### Backend won't start:

- Check MongoDB is running
- Verify `.env` file exists with correct values
- Ensure port 6000 is not in use

### Frontend won't start:

- Make sure dependencies are installed: `cd client && npm install --legacy-peer-deps`
- Check port 3000 is available
- Verify backend is running first

### Can't login:

- Check backend logs for errors
- Verify MongoDB connection
- Ensure user exists in database (register first)

### Real-time updates not working:

- Check Socket.IO connection in browser console
- Verify backend WebSocket is configured correctly
- Check firewall/proxy settings

---

## 📖 API Documentation

Full API documentation is available at: **http://localhost:6000/api-docs**

Key endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `GET /api/patients/:id/summary` - Get patient summary
- `POST /api/visit-reports` - Create visit report
- `GET /api/analytics/overview` - Get analytics

---

## 🚢 Deployment

### Backend:

1. Set environment variables on hosting platform
2. Deploy to Heroku, Railway, Render, or AWS
3. Update MongoDB URI to production database

### Frontend:

1. Build: `npm run build` in client folder
2. Deploy to Vercel, Netlify, or AWS S3
3. Update API base URL to production backend

---

## 📞 Support

For issues or questions:

- Check the main README.md files
- Review API documentation
- Check application logs

---

**Enjoy using ClinicHub! 🎉**
