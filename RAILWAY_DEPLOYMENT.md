# Deploy HireMe Backend on Railway - Step by Step Guide

## 🚂 Why Railway?

- ✅ **No Credit Card Required** for free tier
- ✅ **$5 Monthly Credits** (perfect for development)
- ✅ **Easy GitHub Integration**
- ✅ **Automatic Deployments**
- ✅ **Built-in Environment Variables**
- ✅ **Automatic HTTPS**

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Sign up for a **free account** (no credit card needed)
3. Create a new project: "HireMe"

### 1.2 Create Free Cluster

1. Click "Build a Database"
2. Choose **"M0 Sandbox"** (Free forever)
3. Choose cloud provider and region (pick closest to you)
4. Cluster name: `hireme-cluster`
5. Click "Create"

### 1.3 Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `hireme-admin`
5. **Generate a strong password and SAVE IT!**
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.4 Set Network Access

1. Go to **"Network Access"** in left sidebar
2. Click "Add IP Address"
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose "Connect your application"
4. Copy the connection string:

```
mongodb+srv://hireme-admin:<password>@hireme-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<password>` with your actual password
6. Add `/hireme` before the `?`:

```
mongodb+srv://hireme-admin:yourpassword@hireme-cluster.xxxxx.mongodb.net/hireme?retryWrites=true&w=majority
```

## 🚂 Step 2: Deploy on Railway

### 2.1 Create Railway Account

1. Go to https://railway.app
2. Click **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your repositories

### 2.2 Create New Project

1. Click **"New Project"**
2. Choose **"Deploy from GitHub repo"**
3. Find and select your **"HireMe"** repository
4. Railway will show your repository structure

### 2.3 Configure Service

Railway will auto-detect your Node.js app, but let's configure it properly:

1. **Select the Backend**: Railway might detect multiple services, choose the one that points to your `Back-End` folder
2. If it doesn't auto-detect correctly:
   - Click **"Add Service"**
   - Choose **"GitHub Repo"**
   - Select your repository
   - Set **Root Directory**: `Back-End`

### 2.4 Configure Build Settings

In your service dashboard:

1. Go to **"Settings"** tab
2. **Root Directory**: `Back-End`
3. **Build Command**: `npm install` (usually auto-detected)
4. **Start Command**: `npm start` (usually auto-detected)

### 2.5 Set Environment Variables

1. Go to **"Variables"** tab in your service
2. Click **"New Variable"** and add each of these:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://hireme-admin:yourpassword@hireme-cluster.xxxxx.mongodb.net/hireme?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-32-character-random-jwt-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CORS_ORIGINS=http://localhost:5173
BCRYPT_ROUNDS=12
```

**Important Notes:**

- Replace `MONGODB_URI` with your actual Atlas connection string
- Use a **strong JWT_SECRET** (32+ random characters)
- Replace email credentials with your Gmail App Password
- We'll update `CORS_ORIGINS` later with your Railway domain

### 2.6 Deploy

1. Railway will **automatically deploy** when you push to GitHub
2. Or click **"Deploy"** button in the dashboard
3. Monitor the build logs for any errors
4. Wait for deployment to complete (3-5 minutes)

## ✅ Step 3: Test Your Deployment

### 3.1 Get Your Railway URL

1. In your Railway dashboard, you'll see your service URL
2. It will look like: `https://hireme-backend-production.up.railway.app`
3. **Copy this URL** - you'll need it later!

### 3.2 Test Basic Endpoints

Open these URLs in your browser:

**Health Check:**

```
https://your-railway-url.up.railway.app/
```

Expected response:

```json
{
  "message": "Welcome to HireMe API",
  "status": "running",
  "timestamp": "2025-07-28T...",
  "version": "1.0.0"
}
```

**Seed Admin User:**

```
https://your-railway-url.up.railway.app/seed-admin
```

Expected response:

```json
{
  "message": "Admin user created successfully",
  "email": "admin@HireMe.com",
  "defaultPassword": "admin123 (please change after first login)"
}
```

### 3.3 Update CORS Origins

1. Go back to Railway dashboard
2. Go to **"Variables"** tab
3. Update `CORS_ORIGINS` to include your Railway domain:

```env
CORS_ORIGINS=http://localhost:5173,https://your-railway-url.up.railway.app
```

4. Service will automatically redeploy

## 🔧 Step 4: Update Frontend Configuration

### 4.1 Update Frontend Environment Variables

In your frontend `.env` file:

```env
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_SOCKET_URL=https://your-railway-url.up.railway.app
```

### 4.2 Test Frontend Connection

1. Start your frontend locally: `npm run dev`
2. Try to login or register
3. Check browser console for any CORS errors

## 🚨 Troubleshooting Common Issues

### ❌ Build Fails

**Check Railway logs:**

1. Go to your service dashboard
2. Click **"Deployments"** tab
3. Click on the failed deployment
4. Check build logs for errors

**Common fixes:**

- Ensure `package.json` has all dependencies
- Check that `Back-End` folder structure is correct
- Verify Node.js version compatibility

### ❌ Database Connection Error

**Symptoms:** App crashes on startup, "connection failed" errors

**Solutions:**

1. Double-check MongoDB connection string format
2. Ensure password doesn't have special characters (or URL encode them)
3. Verify IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)
4. Check database user permissions

### ❌ Environment Variables Not Loading

**Solutions:**

1. Check spelling of variable names in Railway dashboard
2. Ensure no extra spaces in values
3. Restart service: Go to service → Settings → Restart

### ❌ CORS Errors in Frontend

**Solutions:**

1. Update `CORS_ORIGINS` with your Railway domain
2. Include both `http://localhost:5173` and your Railway URL
3. Restart service after updating variables

### ❌ Service Sleeps/Stops

**Railway free tier behavior:**

- Services may sleep after inactivity
- They wake up on first request (may take a few seconds)
- $5 monthly credits should be sufficient for development

## 📊 Monitor Your Deployment

### Usage Monitoring

1. Go to Railway dashboard
2. Check **"Metrics"** tab to monitor:
   - CPU usage
   - Memory usage
   - Network requests
   - Credit usage

### Logs Monitoring

1. Go to **"Logs"** tab
2. Monitor for errors or warnings
3. Use logs to debug issues

## 🎯 Next Steps

1. ✅ **Backend deployed on Railway**
2. ✅ **Database connected to MongoDB Atlas**
3. ✅ **Admin user seeded**
4. ✅ **Frontend environment variables updated**
5. 🔄 **Deploy frontend** (Netlify/Vercel)
6. 🔄 **Update CORS with frontend domain**
7. 🔄 **Test full application**

## 💡 Railway Pro Tips

### Automatic Deployments

- Railway automatically deploys when you push to GitHub
- You can disable this in Settings if needed
- Use different branches for staging/production

### Custom Domains (Optional)

- Add custom domain in Railway dashboard
- Configure DNS records
- Automatic SSL certificates

### Environment Management

- Use different Railway projects for staging/production
- Copy environment variables between projects
- Use Railway CLI for advanced management

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://railway.app/discord
- **MongoDB Atlas Support**: https://www.mongodb.com/support
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833

---

## 🎉 Your Backend URLs

After successful deployment, save these:

- **Backend API**: `https://your-railway-url.up.railway.app`
- **Admin Login**: Default credentials are `admin@HireMe.com` / `admin123`
- **Database**: MongoDB Atlas cluster

**Your HireMe backend is now live on Railway! 🚂**

---

_Need help with any step? Railway has excellent documentation and a helpful community Discord!_
