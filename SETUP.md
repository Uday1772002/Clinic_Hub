# ClinicHub - Quick Setup Guide

## Prerequisites
- Node.js v18+ installed
- MongoDB v7.0+ (local or Atlas)
- npm or yarn package manager

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# Required: MONGODB_URI, JWT_SECRET
# Optional: SMTP settings for emails
```

### Step 3: Start the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Docker Mode:**
```bash
docker-compose up -d
```

### Step 4: Verify Installation
```bash
# Test health endpoint
curl http://localhost:6000/health

# Expected response:
# {"success":true,"message":"ClinicHub API is running","timestamp":"...","uptime":...}
```

### Step 5: Access Documentation
Open your browser and navigate to:
- **API Documentation:** http://localhost:6000/api-docs
- **Database UI (Docker):** http://localhost:8081

## Quick Test

### 1. Register a Test Patient
```bash
curl -X POST http://localhost:6000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "email": "test@example.com",
    "password": "Test@1234",
    "phone": "1234567890",
    "role": "patient"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST http://localhost:6000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### 3. Register a Test Doctor
```bash
curl -X POST http://localhost:6000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Dr. John",
    "lastName": "Smith",
    "email": "doctor@example.com",
    "password": "Doctor@1234",
    "phone": "9876543210",
    "role": "doctor",
    "specialization": "General Medicine",
    "licenseNumber": "MD12345"
  }'
```

## Common Commands

```bash
# Development with auto-reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build and run with Docker
docker-compose up --build -d

# View Docker logs
docker-compose logs -f

# Stop Docker containers
docker-compose down

# View application logs
tail -f logs/combined.log
```

## Project Structure
```
ClinicHub/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── app.js           # Main application file
├── __tests__/           # Unit tests
├── logs/                # Application logs
├── .env                 # Environment variables
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── package.json         # Dependencies
```

## Available Roles

1. **Admin**
   - Full system access
   - Manage all appointments
   - View analytics
   - Manage patient summaries

2. **Doctor**
   - View assigned appointments
   - Update appointment status
   - Create visit reports
   - Update patient medical summaries

3. **Patient**
   - Create appointments
   - View own appointments
   - View own medical summary
   - Cancel appointments

## Default Ports
- **API Server:** 6000
- **MongoDB:** 27017
- **Mongo Express:** 8081 (Docker only)

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 6000
lsof -ti:6000 | xargs kill -9

# Or use different port in .env
PORT=7000
```

### MongoDB Connection Error
```bash
# Check MongoDB is running
# For Docker: docker-compose ps
# For local: brew services list (macOS) or systemctl status mongodb (Linux)

# Update MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017/ClinicHub
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Security Notes
- Change JWT_SECRET in production
- Use strong passwords
- Enable HTTPS in production
- Configure CORS properly
- Set up rate limiting
- Enable MongoDB authentication

## Next Steps
1. Explore API documentation at `/api-docs`
2. Read full README.md for detailed features
3. Check API_TESTING.md for testing examples
4. Configure email notifications (optional)
5. Set up monitoring and logging

## Support
- Documentation: http://localhost:6000/api-docs
- Issues: Create an issue in the repository
- Email: support@clinichub.com

---

**Ready to go! Start managing healthcare appointments efficiently.** 🏥
