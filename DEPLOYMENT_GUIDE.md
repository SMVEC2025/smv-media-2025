# MediaHub - Deployment Guide

## 🚀 Quick Start for Developers

This guide will help you deploy the MediaHub application to production.

---

## 📦 **Repository Structure**

```
mediahub/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application file
│   ├── seed_data.py        # Database seeding script
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (DO NOT COMMIT)
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # All page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   └── utils/         # Helper functions
│   ├── package.json       # Node dependencies
│   └── .env              # Environment variables (DO NOT COMMIT)
├── .gitignore             # Files to ignore in Git
├── .env.backend.example   # Backend environment template
├── .env.frontend.example  # Frontend environment template
└── ENV_SETUP_GUIDE.md     # Environment setup instructions
```

---

## 🔧 **Step 1: Setup Environment Variables**

### **Backend Environment**

1. Copy the template:
```bash
cp .env.backend.example backend/.env
```

2. Edit `backend/.env`:
```env
MONGO_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="mediahub_production"
JWT_SECRET="<generate-with: openssl rand -hex 32>"
CORS_ORIGINS="https://your-frontend.vercel.app"
```

### **Frontend Environment**

1. Copy the template:
```bash
cp .env.frontend.example frontend/.env
```

2. Edit `frontend/.env`:
```env
REACT_APP_BACKEND_URL=https://your-backend.railway.app
```

**⚠️ IMPORTANT:** Do NOT include `/api` in the backend URL!

---

## 🗄️ **Step 2: Setup MongoDB Atlas (Free)**

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create FREE M0 cluster (512MB, enough for this app)
3. **Database Access:**
   - Add user: `mediahub_admin`
   - Generate strong password
   - Role: Atlas Admin
4. **Network Access:**
   - Add IP: `0.0.0.0/0` (allow all) OR specific IPs
5. **Get Connection String:**
   - Click "Connect" → "Drivers"
   - Copy connection string
   - Replace `<password>` with actual password
6. **Paste in backend/.env as MONGO_URL**

---

## 🚂 **Step 3: Deploy Backend**

### **Option A: Railway.app** (Recommended)

1. Go to https://railway.app
2. Sign in with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. **Add Service** → **Select backend/ directory**
6. **Environment Variables:**
   - Add all variables from backend/.env
   - Railway provides PORT automatically
7. **Deploy Settings:**
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
8. Railway auto-deploys on Git push
9. **Copy the Railway URL** (e.g., `https://mediahub-production.up.railway.app`)

### **Option B: Render.com**

1. Go to https://render.com
2. **New Web Service**
3. Connect GitHub repository
4. **Settings:**
   - Name: mediahub-backend
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables:** Add all from backend/.env
6. Create Web Service
7. **Copy the Render URL**

### **Option C: DigitalOcean App Platform**

1. Go to DigitalOcean App Platform
2. Create App from GitHub
3. Select backend component
4. Python detected automatically
5. Run Command: `uvicorn server:app --host 0.0.0.0 --port 8080`
6. Add environment variables
7. Deploy

---

## 🌐 **Step 4: Deploy Frontend**

### **Vercel** (Recommended for React)

1. Go to https://vercel.com
2. **Import Project** → Select GitHub repository
3. **Framework Preset:** Create React App (auto-detected)
4. **Root Directory:** `frontend`
5. **Build Settings:**
   - Build Command: `yarn build` (auto)
   - Output Directory: `build` (auto)
   - Install Command: `yarn install` (auto)
6. **Environment Variables:**
   - Key: `REACT_APP_BACKEND_URL`
   - Value: `https://mediahub-production.up.railway.app` (your backend URL)
7. **Deploy**
8. Vercel auto-deploys on Git push

---

## 🗃️ **Step 5: Seed Database (First Time Only)**

After backend is deployed:

```bash
# SSH into your backend server or run locally
cd backend
python seed_data.py
```

This creates:
- 4 demo users (admin, media_head, 2 team_members)
- 3 institutions (SMVEC, SMVNC, TKS)
- 3 events
- 5 tasks
- 3 equipment items

**Demo Accounts:**
- Admin: `admin@media.com` / `password123`
- Media Head: `head@media.com` / `password123`
- Team Member: `member@media.com` / `password123`

---

## ✅ **Step 6: Verify Deployment**

### **Test Backend:**

```bash
# Health check
curl https://your-backend.railway.app/api/auth/me

# Should return 401 (Unauthorized) - means API is working

# Test login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@media.com","password":"password123"}'

# Should return JWT token
```

### **Test Frontend:**

1. Visit `https://your-app.vercel.app`
2. Login with `admin@media.com` / `password123`
3. Check Dashboard loads
4. Check Network tab (F12) for API calls
5. Verify no CORS errors

---

## 🔄 **Continuous Deployment**

Both platforms support auto-deployment:

**Railway/Render/Vercel:**
- Push to GitHub main branch
- Platforms detect changes
- Auto-build and deploy
- Zero downtime deployment
- Rollback available if issues

**Workflow:**
```bash
git add .
git commit -m "Add new feature"
git push origin main
# Wait 2-3 minutes
# Check deployment logs on platform
# Test production URL
```

---

## 🐛 **Troubleshooting**

### **Backend won't start**

Check logs for:
- `ModuleNotFoundError` → Missing dependency in requirements.txt
- `Connection refused` → MongoDB URL incorrect
- `Authentication failed` → MongoDB password wrong
- `CORS error` → CORS_ORIGINS not set correctly

### **Frontend shows blank page**

Check:
- Browser console (F12) for errors
- Network tab for failed API calls
- Environment variable loaded: `console.log(process.env.REACT_APP_BACKEND_URL)`
- Backend URL correct in .env

### **CORS errors**

Fix:
- Backend `.env`: `CORS_ORIGINS="https://your-frontend.vercel.app"`
- Must match EXACTLY (https vs http, www vs non-www)
- Restart backend after changing

### **404 on /api routes**

- Ensure backend URL in frontend .env does NOT include `/api`
- Frontend adds `/api` prefix automatically
- Wrong: `https://backend.com/api`
- Right: `https://backend.com`

---

## 📊 **Resource Requirements**

### **Free Tier Limits (Sufficient for MediaHub):**

**MongoDB Atlas (Free M0):**
- Storage: 512 MB (enough for ~10,000 events)
- Connections: 500 concurrent
- RAM: Shared
- Cost: **$0/month**

**Railway.app (Free Trial):**
- RAM: 512 MB (sufficient for FastAPI)
- Hours: 500/month (enough for development)
- Bandwidth: 100 GB/month
- Cost: **$0/month trial**, then ~$5/month

**Vercel (Free Hobby):**
- Bandwidth: 100 GB/month
- Builds: 6,000 minutes/month
- Unlimited deployments
- Cost: **$0/month**

**Total Monthly Cost (All Free Tier):** $0 initially, then ~$5/month for backend

---

## 🔐 **Security Best Practices**

1. **JWT Secret:**
   - Generate new random 64-character string
   - Never use default value
   - Different for dev/staging/production

2. **MongoDB:**
   - Use strong passwords (16+ characters, mixed case, numbers, symbols)
   - Enable IP whitelist (not 0.0.0.0/0 in production)
   - Create separate database users for dev/prod

3. **CORS:**
   - Set to specific frontend domain
   - Never use "*" in production

4. **Passwords:**
   - Change default demo passwords
   - Require strong passwords for new users
   - Consider adding password strength meter

5. **HTTPS:**
   - Both platforms provide free SSL
   - Always use https:// URLs
   - Enable "Force HTTPS" if available

---

## 📝 **Post-Deployment Checklist**

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database seeded with demo data
- [ ] Can login with demo accounts
- [ ] Dashboard loads with stats
- [ ] Can create new event
- [ ] Can assign task
- [ ] Notifications working
- [ ] Public deliveries page accessible (no login)
- [ ] Mobile responsive (test on phone)
- [ ] No console errors in browser
- [ ] All environment variables set correctly
- [ ] .env files NOT committed to GitHub
- [ ] Changed default JWT_SECRET
- [ ] CORS configured for production domain

---

## 🆘 **Need Help?**

**Common Questions:**

**Q: Which backend platform should I use?**
A: Railway.app is easiest for FastAPI. Render.com is good alternative.

**Q: Can I use Vercel for both frontend and backend?**
A: Vercel supports Next.js backends, not FastAPI. Use separate platforms.

**Q: Do I need to pay for hosting?**
A: You can start FREE (MongoDB Atlas free tier + Railway trial + Vercel free). Later ~$5/month for backend.

**Q: How do I change the database?**
A: Just change MONGO_URL in backend/.env to your new MongoDB Atlas URL.

**Q: Can I deploy to AWS/GCP/Azure?**
A: Yes, but requires more setup (EC2, App Engine, etc.). Railway/Render is simpler.

---

## 📧 **Support**

If you encounter issues:
1. Check platform-specific logs (Railway/Render/Vercel dashboard)
2. Check MongoDB Atlas monitoring
3. Test API endpoints with curl
4. Check browser console (F12)
5. Review environment variables

---

**Your MediaHub application is ready for production deployment!** 🎉
