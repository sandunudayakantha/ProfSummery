# 🚀 Quick Setup Guide

## Prerequisites
- Node.js v14 or higher installed
- MongoDB Atlas account (or local MongoDB)
- Git installed

## Step-by-Step Setup

### 1. Environment Variables Setup

#### Backend (.env file)
Create a file `backend/.env` with:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_very_secret_jwt_key_here
```

**Getting MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `myFirstDatabase` with `profitsummary`

**Generating JWT Secret:**
```bash
# Run this in terminal to generate a random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend (.env file - Optional)
Create a file `frontend/.env` with:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
# From the root directory
npm run install:all

# This will install dependencies for both backend and frontend
```

### 3. Run the Application

```bash
# Development mode (runs both backend and frontend concurrently)
npm run dev
```

**OR run separately:**

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/

### 5. Test the Application

1. **Register a new account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Create a business** from the dashboard
4. **Add some transactions** (income and expenses)
5. **Invite partners** by their email (they need to register first)
6. **View reports** and download as PDF/CSV

## Common Issues & Solutions

### Port Already in Use
If port 5000 or 3000 is already in use:

**Backend:**
```bash
# Change PORT in backend/.env
PORT=5001
```

**Frontend:**
```javascript
// Change port in frontend/vite.config.js
server: {
  port: 3001
}
```

### MongoDB Connection Error
- Check your MongoDB URI is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify your database user credentials

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

## Deployment to Vercel

### 1. Prepare Your Repository
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
5. Click "Deploy"

### 3. Your App is Live! 🎉
Vercel will provide you with a URL like: `https://your-app.vercel.app`

## Project Structure Overview

```
ProfSummery/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite app
├── package.json      # Root package file
├── vercel.json       # Vercel deployment config
└── README.md         # Documentation
```

## Useful Commands

```bash
# Install all dependencies
npm run install:all

# Run both backend and frontend in dev mode
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build frontend for production
npm run build

# Start backend in production
npm run start:backend
```

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create Business (with token)
```bash
curl -X POST http://localhost:5000/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"My Business","description":"A test business"}'
```

## Tech Stack Summary

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS
- React Router DOM
- Axios
- Recharts (charts)
- jsPDF (PDF generation)

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review API endpoints in the README
- Check role permissions table
- Look at the code comments for clarification

## Next Steps After Setup

1. ✅ Register your account
2. ✅ Create your first business
3. ✅ Add a partner to test collaboration
4. ✅ Add some transactions
5. ✅ Generate and download reports
6. ✅ Deploy to Vercel
7. ✅ Share with your team!

---

**Happy tracking! 💰📊**

