# Deployment Checklist for HireMe

## ✅ Pre-Deployment Checklist

### Frontend

- [ ] All TypeScript errors fixed
- [ ] Build process works (`npm run build`)
- [ ] Environment variables configured
- [ ] API URLs point to production backend
- [ ] All unused code removed
- [ ] Security vulnerabilities fixed (`npm audit`)

### Backend

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connection string updated
- [ ] CORS origins set for production
- [ ] JWT secret is secure (32+ characters)
- [ ] Email configuration tested
- [ ] Security vulnerabilities fixed (`npm audit fix`)

### Database

- [ ] MongoDB Atlas cluster created (or local MongoDB secured)
- [ ] Database user created with appropriate permissions
- [ ] Connection string updated in environment variables
- [ ] Admin user seeded (`node src/scripts/seedAdmin.js`)

### Security

- [ ] All sensitive data in environment variables
- [ ] Strong passwords and secrets
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting considered

## 🚀 Deployment Steps

### 1. Frontend Deployment (Netlify/Vercel)

**Option A: Netlify**

1. Build project: `npm run build`
2. Drag and drop `dist/` folder to Netlify
3. Set environment variables in site settings
4. Configure redirects for SPA routing

**Option B: Vercel**

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables

### 2. Backend Deployment

**Option A: Railway**

1. Connect GitHub repository
2. Set environment variables
3. Railway will auto-deploy on push

**Option B: Heroku**

1. Create Heroku app
2. Connect GitHub repository
3. Set environment variables
4. Deploy from dashboard

**Option C: DigitalOcean App Platform**

1. Create new app
2. Connect GitHub repository
3. Set environment variables
4. Configure build settings

### 3. Database Setup

**MongoDB Atlas:**

1. Create cluster
2. Set up database user
3. Configure network access (IP whitelist)
4. Get connection string
5. Update `MONGODB_URI` in backend environment variables

### 4. Environment Variables

**Production Frontend (.env):**

```
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

**Production Backend (.env):**

```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hireme
JWT_SECRET=your-secure-32-character-jwt-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CORS_ORIGINS=https://your-frontend-domain.com
BCRYPT_ROUNDS=12
```

## 🔧 Post-Deployment

### Testing

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] User registration works
- [ ] Login functionality works
- [ ] Real-time features work (Socket.IO)
- [ ] Email sending works
- [ ] Admin functions work
- [ ] Mobile responsiveness

### Monitoring

- [ ] Set up error logging
- [ ] Monitor server performance
- [ ] Check database connections
- [ ] Monitor email delivery
- [ ] Set up uptime monitoring

### DNS & SSL

- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS/SSL certificates
- [ ] Update CORS origins with new domains

## 🚨 Common Issues & Solutions

### Frontend Issues

- **Build fails:** Check TypeScript errors, run `npm run build` locally
- **API calls fail:** Verify `VITE_API_URL` environment variable
- **Routing issues:** Configure SPA redirects on hosting platform

### Backend Issues

- **Server won't start:** Check environment variables, especially `MONGODB_URI`
- **CORS errors:** Update `CORS_ORIGINS` environment variable
- **Database connection fails:** Verify MongoDB Atlas network access and credentials
- **Email not sending:** Check Gmail app password and 2FA settings

### Database Issues

- **Connection timeout:** Check MongoDB Atlas IP whitelist
- **Authentication failed:** Verify database username/password
- **Collections not found:** Run admin seeding script

## 📞 Support Resources

- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Netlify Docs:** https://docs.netlify.com/
- **Vercel Docs:** https://vercel.com/docs
- **Heroku Docs:** https://devcenter.heroku.com/
- **Railway Docs:** https://docs.railway.app/
- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833

---

_Keep this checklist handy during deployment and mark off completed items._
