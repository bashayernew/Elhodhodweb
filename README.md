# HodHod Marketplace Platform

A comprehensive marketplace platform for construction and renovation services, built with React.js frontend and Node.js backend.

## 🚀 Features

### Complete Multi-Step Signup System
- **Role Selection**: Choose between User (Buyer) and Provider (Seller)
- **Account Creation**: Personal information, email, phone, password with strength validation
- **Phone Verification**: OTP verification via email (SMS adapter stubbed)
- **Profile Completion**: Location, bio, and business profile for providers
- **Document Upload**: Required documents for provider verification
- **Review & Submit**: Final review with declarations and submission

### Authentication & Security
- JWT-based authentication
- OTP verification with rate limiting
- Password strength validation
- Role-based access control
- Secure route guards

### Internationalization
- English and Arabic language support
- RTL layout support for Arabic
- Kuwait-specific data (governorates, areas, service categories)

### Database & Backend
- Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- Comprehensive data models
- RESTful API endpoints
- File upload handling
- Email service integration

## 🛠️ Tech Stack

### Frontend
- React.js with React Router
- Tailwind CSS for styling
- Framer Motion for animations
- React Hook Form for form handling
- React Hot Toast for notifications
- React Query for data fetching
- i18next for internationalization

### Backend
- Node.js with Express.js
- Prisma ORM
- JWT authentication
- Nodemailer for emails
- Multer for file uploads
- Socket.IO for real-time features

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HodHod
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 3. Environment Setup
```bash
# In server directory
cp env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 4. Database Setup
```bash
# In server directory
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Start backend (from server directory)
cd server
npm start

# Terminal 2: Start frontend (from root directory)
npm start
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔐 Development Testing

### OTP Verification
In development mode, use OTP code: **123456**

### Test Accounts
- **Admin**: admin@hodhod.com / admin123
- **Provider**: provider@hodhod.com / provider123  
- **User**: user@hodhod.com / user123

## 📱 Signup Flow

### For Users (Buyers)
1. Role Selection → User
2. Account Creation
3. Phone Verification
4. Profile Completion
5. Review & Submit

### For Providers (Sellers)
1. Role Selection → Provider + Individual/Company
2. Account Creation
3. Phone Verification
4. Profile Completion + Business Profile
5. Document Upload
6. Review & Submit

## 🗄️ Database Models

- **User**: Core user information and authentication
- **Profile**: Personal and location details
- **Provider**: Business profile and verification status
- **Document**: File uploads for verification
- **Otp**: Phone verification codes
- **AuditLog**: Admin review tracking

## 🔒 Security Features

- Rate limiting on OTP requests
- Password strength requirements
- JWT token validation
- Role-based access control
- Input validation and sanitization

## 🚧 Production TODOs

- [ ] Implement S3 for file storage
- [ ] Add antivirus scanning for uploads
- [ ] Enable SMS OTP (Twilio/Infobip)
- [ ] Add reCAPTCHA to critical forms
- [ ] Implement PII encryption
- [ ] Harden admin authentication
- [ ] Add comprehensive logging
- [ ] Set up monitoring and alerts

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup/user` - User signup
- `POST /api/auth/signup/provider` - Provider signup
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Admin
- `GET /api/admin/verifications` - Get pending verifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team.
