# Pre-Deployment Checklist for Render

## ✅ Before You Start

### 1. Prerequisites Ready?

- [ ] GitHub repository with your code
- [ ] Gmail account with 2FA enabled
- [ ] Gmail App Password generated

### 2. MongoDB Atlas Setup

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Free tier)
- [ ] Database user created with password saved
- [ ] Network access set to "Allow from anywhere" (0.0.0.0/0)
- [ ] Connection string copied and modified with database name `/hireme`

### 3. Environment Variables Prepared

Prepare these values before deployment:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hireme?retryWrites=true&w=majority
JWT_SECRET=your-32-character-random-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
BCRYPT_ROUNDS=12
```

## 🚀 Deployment Steps on Render

### Step 1: Create Web Service

1. Go to https://render.com
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub account
5. Select "HireMe" repository
6. Choose "pre-deploy" branch

### Step 2: Configure Service

- **Name**: `hireme-backend`
- **Region**: Choose closest to you
- **Branch**: `pre-deploy`
- **Root Directory**: `Back-End`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: `18.x`

### Step 3: Add Environment Variables

Copy and paste each variable from your prepared list above.

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Monitor logs for errors

## 🧪 Post-Deployment Testing

### Test Endpoints

Once deployed, test these URLs (replace with your actual Render URL):

1. **Health Check**: `https://hireme-backend.onrender.com/`
2. **Seed Admin**: `https://hireme-backend.onrender.com/seed-admin`
3. **API Test**: `https://hireme-backend.onrender.com/api/admin/login`

### Expected Responses

**Health Check (`/`):**

```json
{
  "message": "Welcome to HireMe API",
  "status": "running",
  "timestamp": "2025-07-28T...",
  "version": "1.0.0"
}
```

**Seed Admin (`/seed-admin`):**

```json
{
  "message": "Admin user created successfully",
  "email": "admin@HireMe.com",
  "defaultPassword": "admin123 (please change after first login)"
}
```

## 🔧 Common Issues & Quick Fixes

### ❌ Build Fails

- Check build logs in Render dashboard
- Ensure `package.json` has all dependencies
- Verify Node.js version compatibility

### ❌ Database Connection Error

- Double-check MongoDB URI format
- Ensure password doesn't contain special characters that need encoding
- Verify network access in MongoDB Atlas

### ❌ Environment Variables Not Loading

- Check spelling of variable names
- Restart service after adding variables
- Ensure no extra spaces in values

### ❌ CORS Errors (later when testing with frontend)

- Update `CORS_ORIGINS` with your frontend URL
- Include both HTTP and HTTPS versions

## 📝 Save These for Later

After successful deployment, save:

- [ ] Backend URL: `https://hireme-backend.onrender.com`
- [ ] MongoDB connection string
- [ ] Admin login credentials: admin@HireMe.com / admin123

## 🎯 Next Steps After Backend Deployment

1. Update frontend `.env` with backend URL
2. Deploy frontend on Netlify/Vercel
3. Update CORS_ORIGINS with frontend URL
4. Test full application flow
5. Change default admin password

---

**Ready to deploy? Follow the main guide in RENDER_DEPLOYMENT.md!**
