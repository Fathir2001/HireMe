# Deploy HireMe Backend on Koyeb - Complete Guide

## 🌟 Why Koyeb After Railway?

- ✅ **No Credit Card Required** ever
- ✅ **No Monthly Credit Limits** (unlike Railway)
- ✅ **Better Free Tier** (512MB RAM, 100GB bandwidth)
- ✅ **Global Edge Network** (faster performance)
- ✅ **No Sleep Times** (always available)
- ✅ **Easy GitHub Integration**
- ✅ **Automatic HTTPS & Custom Domains**

## 🗄️ Step 1: Database Setup (Keep Existing MongoDB Atlas)

**Good News**: You can keep using your existing MongoDB Atlas setup!

If you need to set up MongoDB Atlas again:

1. Go to https://www.mongodb.com/atlas
2. Use your existing cluster or create a new free one
3. Ensure network access allows "0.0.0.0/0"
4. Keep your connection string ready

## 🚀 Step 2: Deploy on Koyeb

### 2.1 Create Koyeb Account

1. Go to https://www.koyeb.com
2. Click **"Sign up for free"**
3. Choose **"Continue with GitHub"**
4. Authorize Koyeb to access your repositories

### 2.2 Create Your First Service

1. In Koyeb dashboard, click **"Create Service"**
2. Choose **"GitHub"** as your source
3. **Connect Repository**:
   - Select your **"HireMe"** repository
   - Choose **"pre-deploy"** branch (or your main branch)

### 2.3 Configure Service Settings

**Basic Configuration:**

- **Service name**: `hireme-backend`
- **Region**: Choose closest to your location
- **Instance type**: Keep default (Nano - free tier)

**Build Configuration:**

- **Build command**: `npm install`
- **Run command**: `npm start`
- **Working directory**: `Back-End`
- **Port**: `8000` (Koyeb's default port)

### 2.4 Set Environment Variables

Click **"Environment variables"** and add these:

```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://hireme-admin:yourpassword@hireme-cluster.xxxxx.mongodb.net/hireme?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-32-character-random-jwt-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CORS_ORIGINS=http://localhost:5173
BCRYPT_ROUNDS=12
```

**Important Notes:**

- Replace `MONGODB_URI` with your actual Atlas connection string
- Use the same `JWT_SECRET` from Railway (or generate a new strong one)
- Replace email credentials with your actual Gmail App Password
- We'll update `CORS_ORIGINS` later with your Koyeb domain

### 2.5 Deploy

1. Click **"Deploy"**
2. Koyeb will start building your application
3. Monitor the build logs for any errors
4. Wait for deployment to complete (3-5 minutes)

### 2.6 Get Your Koyeb URL

Once deployed, you'll get a URL like:

```
https://hireme-backend-your-app-id.koyeb.app
```

**Save this URL - you'll need it!**

## ✅ Step 3: Test Your Deployment

### 3.1 Test Basic Health Check

Open in browser:

```
https://hireme-backend-your-app-id.koyeb.app/
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

### 3.2 Seed Admin User

Open in browser:

```
https://hireme-backend-your-app-id.koyeb.app/seed-admin
```

Expected response:

```json
{
  "message": "Admin user created successfully",
  "email": "admin@HireMe.com",
  "defaultPassword": "admin123 (please change after first login)"
}
```

### 3.3 Test API Endpoint

Test a protected endpoint:

```
https://hireme-backend-your-app-id.koyeb.app/api/admin/login
```

Should return a login form or error (not a 500 error).

## 🔧 Step 4: Update Configuration

### 4.1 Update CORS Origins

1. Go back to Koyeb dashboard
2. Go to your service → **"Settings"**
3. Update the `CORS_ORIGINS` environment variable:

```env
CORS_ORIGINS=http://localhost:5173,https://hireme-backend-your-app-id.koyeb.app
```

4. Save changes (service will automatically redeploy)

### 4.2 Update Frontend Environment Variables

In your frontend `.env` file:

```env
VITE_API_URL=https://hireme-backend-your-app-id.koyeb.app
VITE_SOCKET_URL=https://hireme-backend-your-app-id.koyeb.app
```

### 4.3 Test Frontend Connection

1. Start your frontend: `npm run dev`
2. Try to access admin login or service booking
3. Check browser console for CORS errors

## 🚨 Troubleshooting Common Issues

### ❌ Build Fails

**Check Koyeb logs:**

1. Go to your service dashboard
2. Click **"Logs"** tab
3. Look for build errors

**Common fixes:**

- Ensure `Back-End/package.json` exists
- Check all dependencies are listed
- Verify Node.js compatibility

### ❌ "Cannot find module 'socket.io'" Error

**Symptoms:** App crashes with `Error: Cannot find module 'socket.io'`

**Solution:** This was already fixed in the latest version, but if you encounter it:

```bash
cd Back-End
npm install socket.io@^4.8.1
git add .
git commit -m "Add missing socket.io dependency"
git push
```

Koyeb will automatically redeploy with the fix.

### ❌ App Crashes on Startup

**Symptoms:** Service shows as "unhealthy" or keeps restarting

**Check these:**

1. **MongoDB Connection**: Verify connection string is correct
2. **Port Configuration**: Ensure `PORT=8000` in environment variables
3. **Environment Variables**: Check all required variables are set

**Debug steps:**

```bash
# Check if your connection string works locally
node -e "const mongoose = require('mongoose'); mongoose.connect('your-connection-string').then(() => console.log('Connected')).catch(err => console.error(err));"
```

### ❌ Environment Variables Not Loading

**Solutions:**

1. Double-check variable names (case-sensitive)
2. Ensure no extra spaces in values
3. Try redeploying the service
4. Check Koyeb logs for "env" related errors

### ❌ CORS Errors

**Symptoms:** Frontend can't connect, browser shows CORS errors

**Solutions:**

1. Update `CORS_ORIGINS` with your Koyeb domain
2. Include both localhost and production URLs
3. Restart service after updating variables
4. Check your Express CORS configuration

### ❌ MongoDB Connection Issues

**Common problems:**

1. **Password contains special characters**: URL encode them
2. **IP whitelist**: Ensure 0.0.0.0/0 is allowed
3. **Database name**: Ensure `/hireme` is in the connection string
4. **User permissions**: Verify database user has read/write access

## 📊 Monitor Your Koyeb Deployment

### 📈 Usage Monitoring

1. Go to Koyeb dashboard
2. Check **"Metrics"** to monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### 📋 Logs Monitoring

1. Click **"Logs"** tab
2. Monitor for errors or warnings
3. Use logs to debug issues
4. Filter by log level (error, warn, info)

### 🔔 Alerts (Optional)

- Set up email notifications for service failures
- Configure uptime monitoring
- Monitor resource usage

## 💡 Koyeb Pro Tips

### 🔄 Automatic Deployments

- Koyeb automatically redeploys when you push to GitHub
- You can pause auto-deployments in settings if needed
- Use different branches for different environments

### 🌐 Custom Domains (Free)

1. Go to service settings → **"Domains"**
2. Add your custom domain
3. Configure DNS records as shown
4. Get free SSL certificate automatically

### ⚙️ Multiple Environments

- Create different services for staging/production
- Use different branches (staging, main, production)
- Copy environment variables between services

### 📦 Service Management

- **Scale**: Upgrade to paid plans for more resources
- **Regions**: Deploy in multiple regions for better performance
- **Rollbacks**: Easy rollback to previous deployments

## 🔄 Migration from Railway Checklist

### ✅ Before Migration:

- [ ] Export all environment variables from Railway
- [ ] Note your current Railway domain
- [ ] Backup your MongoDB data (optional)

### ✅ During Migration:

- [ ] Deploy to Koyeb using this guide
- [ ] Test all endpoints work
- [ ] Seed admin user
- [ ] Update frontend environment variables

### ✅ After Migration:

- [ ] Test full application workflow
- [ ] Update any hardcoded URLs
- [ ] Monitor Koyeb metrics
- [ ] Optionally deactivate Railway service

## 🎯 Next Steps

1. ✅ **Backend deployed on Koyeb**
2. ✅ **Database connected (MongoDB Atlas)**
3. ✅ **Admin user seeded**
4. ✅ **Frontend environment updated**
5. 🔄 **Deploy frontend** (Netlify/Vercel)
6. 🔄 **Update CORS with frontend domain**
7. 🔄 **Test complete application**
8. 🔄 **Set up monitoring**

## 📞 Support Resources

- **Koyeb Documentation**: https://www.koyeb.com/docs
- **Koyeb Community**: https://community.koyeb.com
- **GitHub Issues**: For your repository issues
- **MongoDB Atlas**: https://www.mongodb.com/support

---

## 🎉 Your New Backend URLs

After successful deployment:

- **API Base**: `https://hireme-backend-your-app-id.koyeb.app`
- **Health Check**: `https://hireme-backend-your-app-id.koyeb.app/`
- **Admin Seed**: `https://hireme-backend-your-app-id.koyeb.app/seed-admin`
- **Admin Login**: Default is `admin@HireMe.com` / `admin123`

## 🚀 Performance Benefits vs Railway

**Koyeb Advantages:**

- ✅ **No sleep times** (always responsive)
- ✅ **Global edge network** (faster worldwide)
- ✅ **Better free tier limits**
- ✅ **No monthly credit exhaustion**
- ✅ **Built-in DDoS protection**

---

**Your HireMe backend is now running on Koyeb! 🌟**

_Koyeb's global edge network means your API will be fast worldwide, and the generous free tier means you won't run out of credits like on Railway._
