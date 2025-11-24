# MediaHub - Environment Setup Guide

## 📋 Quick Setup

### Backend (.env)

1. Copy the template:
```bash
cp .env.backend.example backend/.env
```

2. Edit `backend/.env` and set:
```env
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="mediahub_production"
JWT_SECRET="<run: python -c 'import secrets; print(secrets.token_hex(32))'>"
CORS_ORIGINS="https://your-frontend-domain.vercel.app"
```

### Frontend (.env)

1. Copy the template:
```bash
cp .env.frontend.example frontend/.env
```

2. Edit `frontend/.env` and set:
```env
REACT_APP_BACKEND_URL=https://your-backend.railway.app
```

---

## 🗄️ MongoDB Atlas Setup (Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Create a FREE cluster (M0)
4. Database Access → Add Database User:
   - Username: `mediahub_admin`
   - Password: Generate secure password
   - Roles: Atlas Admin
5. Network Access → Add IP Address:
   - For development: `0.0.0.0/0` (allow all)
   - For production: Add your server IPs
6. Connect → Drivers → Copy connection string:
   ```
   mongodb+srv://mediahub_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with actual password
8. Use this as `MONGO_URL`

---

## 🔐 Generate Secure JWT Secret

Run one of these:

**Python:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**OpenSSL:**
```bash
openssl rand -hex 32
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use as `JWT_SECRET`

---

## 🚀 Deployment Platforms

### **Backend Options:**

**Option 1: Railway.app** (Recommended for FastAPI)
```
1. Connect GitHub repo
2. Select backend/ directory
3. Add environment variables
4. Railway auto-detects Python and installs dependencies
5. Start command: uvicorn server:app --host 0.0.0.0 --port $PORT
```

**Option 2: Render.com**
```
1. New Web Service → Connect GitHub
2. Root Directory: backend
3. Build Command: pip install -r requirements.txt
4. Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
5. Add environment variables
```

**Option 3: DigitalOcean App Platform**
```
1. Create App → Select GitHub repo
2. Component: backend/ (Python)
3. Run Command: uvicorn server:app --host 0.0.0.0 --port 8080
4. Environment variables
```

### **Frontend: Vercel** (Recommended)

```
1. Import GitHub repository
2. Framework Preset: Create React App
3. Root Directory: frontend
4. Build Command: yarn build
5. Output Directory: build
6. Install Command: yarn install
7. Environment Variables:
   - REACT_APP_BACKEND_URL = <your-backend-url>
```

---

## ✅ Environment Variables Checklist

**Backend (.env):**
- [ ] MONGO_URL (MongoDB Atlas connection string)
- [ ] DB_NAME (mediahub_production)
- [ ] JWT_SECRET (64-character random hex)
- [ ] CORS_ORIGINS (your frontend URL)

**Frontend (.env):**
- [ ] REACT_APP_BACKEND_URL (your backend URL, no /api suffix)

---

## 🔒 Security Checklist

- [ ] Generated new random JWT_SECRET (not default)
- [ ] CORS_ORIGINS set to specific domain (not "*")
- [ ] MongoDB user has strong password
- [ ] MongoDB IP whitelist configured
- [ ] .env files added to .gitignore
- [ ] .env files NEVER committed to Git
- [ ] Separate .env for dev and production

---

## 📦 .gitignore (Important!)

Ensure your developer adds this to `.gitignore`:

```
# Environment files
.env
.env.local
.env.production
*.env

# Dependencies
node_modules/
__pycache__/
.venv/
venv/

# Build outputs
build/
dist/
*.pyc

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
```

---

## 🧪 Testing Environment Variables

**After setting up .env files, test:**

**Backend:**
```bash
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('MONGO_URL:', os.getenv('MONGO_URL')[:20]+'...'); print('DB_NAME:', os.getenv('DB_NAME')); print('JWT_SECRET:', 'SET' if os.getenv('JWT_SECRET') else 'NOT SET')"
```

**Frontend:**
```bash
cd frontend
node -e "require('dotenv').config(); console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL)"
```

---

## 🆘 Common Issues

**Issue:** "Cannot connect to MongoDB"
- Check MONGO_URL is correct
- Check MongoDB Atlas IP whitelist
- Check database user credentials

**Issue:** "CORS error"
- Check CORS_ORIGINS includes frontend URL
- Check frontend URL matches exactly (http vs https, www vs non-www)

**Issue:** "Environment variables not loading"
- Check .env file is in correct directory (backend/.env, frontend/.env)
- Check file name is exactly `.env` (not .env.txt)
- Restart server after changing .env

---

Let me know if you need help setting up any of these!
