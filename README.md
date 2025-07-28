# HireMe – Real-Time Service Booking Platform

HireMe is a full-stack web application that connects service needers with trusted service providers (electricians, plumbers, mechanics, etc.) in a secure, real-time environment. It includes separate interfaces for Service Needers, Service Providers, and Admins with features like OTP verification, live booking updates, and admin moderation.

---

## 📌 Table of Contents

- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)

---

## ✅ Features

- Role-based login: Service Needer, Service Provider, Admin
- Secure password hashing and OTP-based reset
- Real-time notifications via Socket.IO
- Service booking with automatic provider matching
- OTP verification for service start
- Admin dashboard for user and request management
- Dynamic status tracking for service requests
- Responsive UI for desktop and mobile

---

## 👤 User Roles

| Role             | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| Service Needer   | Book services, track progress, reset password via OTP        |
| Service Provider | Register, accept jobs, start services with OTP, edit profile |
| Admin            | Approve/reject providers, view service stats, monitor users  |

---

## 💻 Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React 19, TypeScript, Vite         |
| Backend  | Node.js, Express.js, Mongoose      |
| Database | MongoDB                            |
| Realtime | Socket.IO                          |
| Email    | Nodemailer (Gmail SMTP)            |
| Auth     | JWT + OTP (one-time password)      |
| Build    | Vite (Frontend), Node.js (Backend) |

---

## 🗂️ Project Structure

```
HireMe/
├── src/                          # Frontend source
│   ├── pages/                   # React pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── serviceNeeder/      # Service needer interface
│   │   └── serviceProvider/    # Service provider interface
│   ├── components/             # Reusable components
│   └── assets/                 # Static assets
├── Back-End/                   # Backend source
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth & validation
│   │   ├── utils/             # Utility functions
│   │   └── index.js          # Entry point
├── public/                     # Static files
├── dist/                       # Build output (generated)
├── package.json               # Frontend dependencies
├── Back-End/package.json      # Backend dependencies
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16 or later)
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Fathir2001/HireMe.git
cd HireMe
```

### 2. Install Dependencies

**Frontend:**

```bash
npm install
```

**Backend:**

```bash
cd Back-End
npm install
cd ..
```

### 3. Environment Setup

**Frontend Environment (.env):**

```bash
# Copy example file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Backend Environment (Back-End/.env):**

```bash
# Copy example file
cd Back-End
cp .env.example .env
```

Edit `Back-End/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hireme
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
BCRYPT_ROUNDS=12
```

### 4. Database Setup

**Local MongoDB:**

- Install MongoDB locally
- Start MongoDB service
- Database will be created automatically

**MongoDB Atlas (Cloud):**

- Create account at mongodb.com/atlas
- Create cluster and get connection string
- Replace `MONGODB_URI` in `.env`

### 5. Email Setup (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password (not regular password) in `EMAIL_PASS`

### 6. Create Admin User

```bash
cd Back-End
node src/scripts/seedAdmin.js
```

### 7. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd Back-End
npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

Visit: http://localhost:5173

---

## 🌐 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the frontend:**

```bash
npm run build
```

2. **Deploy dist/ folder to:**

   - **Netlify:** Drag & drop `dist/` folder
   - **Vercel:** Connect GitHub repo, set build command: `npm run build`

3. **Environment Variables:**
   Set production URLs in your hosting platform:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_SOCKET_URL=https://your-backend-url.com
   ```

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Prepare for deployment:**

   - Ensure all dependencies are in `package.json`
   - Set `NODE_ENV=production` in environment variables

2. **Environment Variables (Production):**

   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hireme
   JWT_SECRET=your-production-jwt-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   CORS_ORIGINS=https://your-frontend-url.com,https://your-domain.com
   ```

3. **Deploy to Platform:**
   - **Heroku:** Connect GitHub, set build commands
   - **Railway:** Connect GitHub repo
   - **DigitalOcean App Platform:** Use GitHub integration

---

## 🔐 Security Considerations

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable MongoDB authentication in production
- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Use environment variables for sensitive data
- [ ] Regular security audits (`npm audit`)

---

## 🔐 API Endpoints (Overview)

### Service Needers

- `POST /api/service-needers/register` - Register new service needer
- `POST /api/service-needers/login` - Login
- `POST /api/service-needers/forgot-password` - Password reset

### Service Requests

- `POST /api/service-requests/create` - Create service request
- `GET /api/service-requests/my-requests` - Get user's requests
- `PUT /api/service-requests/update/:id` - Update request status

### Service Providers

- `POST /api/service-providers/register` - Register new provider
- `POST /api/service-providers/login` - Login
- `GET /api/service-providers/pending` - Get pending applications

### Admin

- `POST /api/admin/login` - Admin login
- `GET /api/admin/providers` - Get all providers
- `PUT /api/admin/approve/:id` - Approve/reject provider

---

## � Future Enhancements

- [ ] Mobile app version (React Native)
- [ ] Payment integration (Stripe/PayPal)
- [ ] Customer reviews and ratings
- [ ] Location-based provider filtering
- [ ] In-app chat system
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

**Project Owner:** Fathir2001  
**Repository:** https://github.com/Fathir2001/HireMe

---

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Socket.IO for real-time capabilities
- All contributors and testers

---

_Built with ❤️ for connecting service providers with customers_
