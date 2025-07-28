# Deploy HireMe Backend on Render - Step by Step Guide

## 🚀 Step 1: Prepare Your Backend for Render

### 1.1 Add Node.js Version Specification

First, let me add the Node.js version to your package.json to ensure Render uses the correct version.

### 1.2 Create render.yaml (Optional but Recommended)

This file tells Render exactly how to deploy your app.

## 🗄️ Step 2: Set Up MongoDB Atlas (Database)

Since Render's free tier doesn't include database hosting, you'll need MongoDB Atlas:

### 2.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new project (name it "HireMe")

### 2.2 Create a Cluster

1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Choose your preferred cloud provider and region
4. Name your cluster (e.g., "hireme-cluster")
5. Click "Create"

### 2.3 Create Database User

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `hireme-admin` (or any name you prefer)
5. Generate a secure password and SAVE IT!
6. For "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

### 2.4 Set Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Render to connect
4. Click "Confirm"

### 2.5 Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://hireme-admin:<password>@hireme-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the actual password you created
6. Add `/hireme` at the end before the query parameters:
   ```
   mongodb+srv://hireme-admin:yourpassword@hireme-cluster.xxxxx.mongodb.net/hireme?retryWrites=true&w=majority
   ```

## 🌐 Step 3: Deploy on Render

### 3.1 Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account (recommended)

### 3.2 Create New Web Service

1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub account if not already connected
4. Find and select your "HireMe" repository
5. Choose the branch (usually "main" or "pre-deploy")

### 3.3 Configure Deployment Settings

Fill in these settings:

**Basic Settings:**

- **Name**: `hireme-backend` (or any name you prefer)
- **Region**: Choose closest to your location
- **Branch**: `pre-deploy` (or your main branch)
- **Root Directory**: `Back-End`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**

- **Node Version**: `18.x` (or `20.x`)

### 3.4 Set Environment Variables

In the "Environment Variables" section, add these:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://hireme-admin:yourpassword@hireme-cluster.xxxxx.mongodb.net/hireme?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
BCRYPT_ROUNDS=12
```

**Important Notes:**

- Replace `MONGODB_URI` with your actual Atlas connection string
- Use a strong `JWT_SECRET` (32+ characters, random)
- Replace email credentials with your actual Gmail app password
- Add your frontend domain to `CORS_ORIGINS` once deployed

### 3.5 Deploy

1. Click "Create Web Service"
2. Render will automatically start deploying
3. Wait for the deployment to complete (5-10 minutes)

## ✅ Step 4: Test Your Deployment

### 4.1 Check Deployment Status

1. Monitor the deployment logs in Render dashboard
2. Look for "Your service is live" message
3. Note your backend URL (e.g., `https://hireme-backend.onrender.com`)

### 4.2 Test API Endpoints

Open your browser or use curl to test:

```bash
# Test basic endpoint
https://your-backend-url.onrender.com/

# Test API health
https://your-backend-url.onrender.com/api/admin/login
```

### 4.3 Seed Admin User

Once deployed, you can seed the admin user by accessing:

```
https://your-backend-url.onrender.com/seed-admin
```

Or run it via Render's console.

## 🔧 Step 5: Update Frontend Configuration

Once your backend is deployed, update your frontend:

### 5.1 Update Frontend Environment Variables

In your frontend `.env` file:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

### 5.2 Update CORS Origins

Go back to Render dashboard:

1. Go to your service settings
2. Update `CORS_ORIGINS` environment variable
3. Add your frontend domain once it's deployed

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails

**Solution**: Check the build logs for specific errors. Common fixes:

- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility

### Issue 2: Database Connection Fails

**Solution**:

- Verify MongoDB Atlas connection string
- Check if IP whitelist includes "0.0.0.0/0"
- Ensure database user has correct permissions

### Issue 3: Environment Variables Not Working

**Solution**:

- Double-check all environment variables in Render dashboard
- Restart the service after adding variables

### Issue 4: CORS Errors

**Solution**:

- Update `CORS_ORIGINS` with your frontend domain
- Ensure both HTTP and HTTPS versions are included

### Issue 5: Service Goes to Sleep (Free Tier)

**Solution**:

- Render's free tier sleeps after 15 minutes of inactivity
- Consider upgrading to paid tier for production
- Use services like UptimeRobot to ping your service

## 📱 Step 6: Monitor Your Deployment

### 6.1 Monitor Logs

- Check Render dashboard for real-time logs
- Monitor for errors or warnings

### 6.2 Set Up Alerts (Optional)

- Configure email notifications for deployment failures
- Set up uptime monitoring

## 🎯 Next Steps

1. ✅ Deploy backend on Render
2. ✅ Update frontend environment variables
3. ✅ Deploy frontend (Netlify/Vercel)
4. ✅ Test full application functionality
5. ✅ Set up custom domain (optional)

---

**🔗 Useful Links:**

- Render Documentation: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/atlas
- Gmail App Passwords: https://support.google.com/accounts/answer/185833

**🆘 Need Help?**
If you encounter issues, check:

1. Render deployment logs
2. MongoDB Atlas network access
3. Environment variables spelling and values
4. CORS configuration

---

_Your backend URL will be: `https://hireme-backend.onrender.com` (or whatever name you choose)_
