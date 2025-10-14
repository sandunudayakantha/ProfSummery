# ⚡ Quick Reference Guide

## 🏃‍♂️ Quick Start (3 Steps)

```bash
# 1. Install dependencies
npm run install:all

# 2. Create backend/.env file with:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5000

# 3. Run the app
npm run dev
```

**Access at**: http://localhost:3000

---

## 📂 Project Structure (Visual Tree)

```
ProfSummery/
│
├── 📦 backend/
│   ├── 📁 config/
│   │   └── db.js                    # MongoDB connection
│   ├── 📁 controllers/
│   │   ├── authController.js        # Register, Login
│   │   ├── businessController.js    # CRUD for businesses
│   │   ├── partnerController.js     # Add/Remove partners
│   │   ├── transactionController.js # Income/Expense CRUD
│   │   └── reportController.js      # Generate reports
│   ├── 📁 middleware/
│   │   └── authMiddleware.js        # JWT verification, role checks
│   ├── 📁 models/
│   │   ├── User.js                  # User schema + password hashing
│   │   ├── Business.js              # Business schema + partners
│   │   └── Transaction.js           # Transaction schema
│   ├── 📁 routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── businessRoutes.js        # /api/business/*
│   │   ├── partnerRoutes.js         # /api/business/:id/partners/*
│   │   ├── transactionRoutes.js     # /api/business/:id/transactions/*
│   │   └── reportRoutes.js          # /api/business/:id/reports/*
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── 🎨 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── BusinessCard.jsx     # Business display card
│   │   │   ├── TransactionForm.jsx  # Add/Edit transaction form
│   │   │   └── ProtectedRoute.jsx   # Auth guard component
│   │   ├── 📁 pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── BusinessDetails.jsx  # Business detail page
│   │   │   ├── Reports.jsx          # Reports with charts
│   │   │   └── NotFound.jsx         # 404 page
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── 📁 utils/
│   │   │   └── api.js               # Axios instance + interceptors
│   │   ├── App.jsx                  # Main app + routing
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind + global styles
│   ├── index.html
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js
│   └── package.json
│
├── 📖 Documentation/
│   ├── README.md                    # Main documentation
│   ├── SETUP_GUIDE.md              # Local setup guide
│   ├── DEPLOYMENT.md               # Vercel deployment
│   ├── ENV_TEMPLATE.md             # Environment variables
│   ├── API_TESTING.md              # API examples
│   ├── PROJECT_SUMMARY.md          # Project overview
│   └── QUICK_REFERENCE.md          # This file
│
├── ⚙️  Configuration/
│   ├── package.json                 # Root package (scripts)
│   ├── vercel.json                  # Vercel deployment config
│   └── .gitignore                   # Git ignore rules
│
└── 🔐 Environment Files (YOU CREATE)
    ├── backend/.env                 # Backend environment vars
    └── frontend/.env                # Frontend environment vars (optional)
```

---

## 🎯 Feature Map

```
Authentication
├── Register → POST /api/auth/register
├── Login → POST /api/auth/login
└── Get Me → GET /api/auth/me

Business Management
├── Create → POST /api/business
├── Get All → GET /api/business
├── Get One → GET /api/business/:id
├── Update → PUT /api/business/:id
└── Delete → DELETE /api/business/:id

Partner Management
├── Add → POST /api/business/:id/partners
├── List → GET /api/business/:id/partners
├── Update Role → PUT /api/business/:id/partners/:partnerId
└── Remove → DELETE /api/business/:id/partners/:partnerId

Transactions
├── Create → POST /api/business/:id/transactions
├── List → GET /api/business/:id/transactions
├── Get One → GET /api/business/:id/transactions/:txId
├── Update → PUT /api/business/:id/transactions/:txId
└── Delete → DELETE /api/business/:id/transactions/:txId

Reports
├── Generate → GET /api/business/:id/reports?period=monthly
├── Statistics → GET /api/business/:id/reports/stats
├── Download PDF → Frontend feature
└── Download CSV → Frontend feature
```

---

## 🔑 Common Commands

### Development
```bash
# Install all dependencies
npm run install:all

# Run both backend + frontend
npm run dev

# Run backend only (port 5000)
npm run dev:backend

# Run frontend only (port 3000)
npm run dev:frontend
```

### Production
```bash
# Build frontend
npm run build

# Start backend
npm run start:backend
```

### Testing
```bash
# Test backend
curl http://localhost:5000/api

# Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/business
```

---

## 🔐 Environment Variables Cheatsheet

### backend/.env
```env
MONGO_URI=mongodb+srv://user:pass@cluster.net/profitsummary
JWT_SECRET=random_64_character_secret
NODE_ENV=development
PORT=5000
```

### frontend/.env (optional)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎨 UI Routes

```
Public Routes:
├── /login              → Login page
├── /register           → Registration page
└── /*                  → 404 page

Protected Routes (require auth):
├── /                   → Redirect to dashboard
├── /dashboard          → List of businesses
├── /business/:id       → Business details
└── /business/:id/reports → Reports page
```

---

## 🛠️ Tech Stack Quick Reference

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (jsonwebtoken)
- **Security**: bcryptjs
- **Middleware**: CORS

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP**: Axios
- **Charts**: Recharts
- **PDF**: jsPDF + jspdf-autotable

---

## 🔒 Role Permissions Quick Matrix

| Action | Owner | Editor | Viewer |
|--------|:-----:|:------:|:------:|
| View | ✅ | ✅ | ✅ |
| Add Transaction | ✅ | ✅ | ❌ |
| Edit/Delete Transaction | ✅ | ✅ | ❌ |
| Add/Remove Partner | ✅ | ❌ | ❌ |
| Edit/Delete Business | ✅ | ❌ | ❌ |

---

## 🚀 Deployment Quick Steps

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to vercel.com
# 3. Import project
# 4. Add environment variables:
#    - MONGO_URI
#    - JWT_SECRET
#    - NODE_ENV=production
# 5. Deploy!
```

---

## 🐛 Troubleshooting Quick Fixes

### "Cannot connect to MongoDB"
```bash
# Check MONGO_URI format
# Whitelist 0.0.0.0/0 in MongoDB Atlas
# Verify database user credentials
```

### "Module not found"
```bash
npm run install:all
```

### "Port already in use"
```bash
# Change PORT in backend/.env
PORT=5001
```

### "Unauthorized" error
```bash
# Check token in localStorage
# Re-login to get new token
```

---

## 📝 Common Code Snippets

### Add Authorization Header (Frontend)
```javascript
const response = await api.get('/business');
// Token automatically added by api.js interceptor
```

### Create Transaction
```javascript
const transaction = await api.post(`/business/${id}/transactions`, {
  type: 'income',
  amount: 5000,
  description: 'Client payment',
  date: '2024-01-15'
});
```

### Generate Report
```javascript
const report = await api.get(`/business/${id}/reports?period=monthly`);
```

---

## 🎯 Key Files to Know

| File | Purpose | When to Edit |
|------|---------|--------------|
| `backend/server.js` | Express app setup | Add new middleware |
| `backend/models/*.js` | Database schemas | Change data structure |
| `backend/routes/*.js` | API routes | Add new endpoints |
| `backend/controllers/*.js` | Business logic | Change functionality |
| `frontend/src/App.jsx` | React routing | Add new pages |
| `frontend/src/utils/api.js` | Axios config | Change API settings |
| `vercel.json` | Deployment config | Change routing |
| `package.json` | Dependencies | Add new packages |

---

## 📊 Data Flow Diagram

```
User Action (Frontend)
    ↓
React Component
    ↓
api.js (Axios) → Add JWT token
    ↓
HTTP Request → /api/...
    ↓
Express Server (backend/server.js)
    ↓
Route (routes/*.js)
    ↓
Middleware (authMiddleware.js) → Verify JWT
    ↓
Controller (controllers/*.js) → Business Logic
    ↓
Model (models/*.js) → MongoDB Query
    ↓
MongoDB Database
    ↓
Response ← JSON
    ↓
React Component Updates
    ↓
UI Re-renders
```

---

## 🎓 Learning Path

1. **Understand the flow**: User → Frontend → API → Database
2. **Start with models**: See how data is structured
3. **Check routes**: Understand available endpoints
4. **Read controllers**: Learn business logic
5. **Explore frontend pages**: See how UI works
6. **Test APIs**: Use API_TESTING.md examples
7. **Deploy**: Follow DEPLOYMENT.md

---

## 📚 Documentation Quick Links

- **Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Deploy**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Environment**: [ENV_TEMPLATE.md](./ENV_TEMPLATE.md)
- **API Testing**: [API_TESTING.md](./API_TESTING.md)
- **Full Docs**: [README.md](./README.md)
- **Overview**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## ✅ Pre-Launch Checklist

- [ ] Dependencies installed (`npm run install:all`)
- [ ] `backend/.env` file created with valid values
- [ ] MongoDB Atlas cluster created
- [ ] Tested locally (`npm run dev`)
- [ ] All features working
- [ ] Git repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] Deployed successfully
- [ ] Production site tested

---

## 🆘 Quick Help

**Backend not starting?**
→ Check `backend/.env` exists and has MONGO_URI

**Frontend blank page?**
→ Check browser console for errors

**API 401 Unauthorized?**
→ Login again to get fresh token

**Can't add partner?**
→ Partner must register first

**Charts not showing?**
→ Add some transactions first

---

## 🎉 Success Indicators

✅ Can register and login  
✅ Can create a business  
✅ Can add transactions  
✅ Can see statistics  
✅ Can generate reports  
✅ Can download PDF/CSV  
✅ Can add partners  
✅ Role permissions work  

---

**Everything you need in one place! 🚀**

For detailed information, check the respective documentation files.

