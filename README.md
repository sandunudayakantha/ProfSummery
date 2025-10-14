# 💰 Profit Summary App

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed for small business owners and partners to track income and expenses collaboratively with role-based access control.

## ✨ Features

### 🔐 Authentication
- User registration and login with JWT-based authentication
- Password hashing with bcrypt
- Secure token storage and management

### 🏢 Business Management
- Create and manage multiple businesses
- Owner and partner-based access control
- Business descriptions and metadata

### 👥 Partner Management
- Add partners by email with role assignment
- Three role levels:
  - **Owner**: Full control over business
  - **Editor**: Can add/edit/delete transactions
  - **Viewer**: Read-only access
- Manage partner permissions

### 💸 Transaction Management
- Track income and expenses
- Add detailed descriptions and dates
- Edit and delete transactions (Editor/Owner only)
- View transaction history with filters

### 📊 Reports & Analytics
- Generate reports by date range (daily, monthly, yearly, custom)
- Visual charts with Recharts (line and bar charts)
- Summary statistics (total income, expenses, profit)
- Download reports as PDF or CSV
- Monthly trend analysis

### 🎨 Modern UI
- Clean and responsive design with Tailwind CSS
- Intuitive navigation with React Router
- Protected routes for authenticated users
- Loading states and error handling

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server and API
- **MongoDB** & **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **jsPDF** & **jspdf-autotable** - PDF generation

## 📁 Project Structure

```
profit-summary-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── businessController.js
│   │   ├── partnerController.js
│   │   ├── transactionController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Business.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── businessRoutes.js
│   │   ├── partnerRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── reportRoutes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── BusinessCard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BusinessDetails.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── vercel.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ProfSummery
```

2. **Install dependencies**
```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately
npm run install:backend
npm run install:frontend
```

3. **Setup environment variables**

Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Create a `.env` file in the `frontend` directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Run the application**

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or run separately
npm run dev:backend
npm run dev:frontend
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📦 Deployment on Vercel

### Prerequisites
- Vercel account
- MongoDB Atlas database

### Steps

1. **Push your code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import project to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your repository

3. **Configure environment variables in Vercel**

Add the following environment variables in Vercel project settings:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to `production`

4. **Deploy**
- Vercel will automatically build and deploy your application
- The backend will be accessible via `/api/*` routes
- The frontend will be served from the root

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Business
- `GET /api/business` - Get all businesses (protected)
- `POST /api/business` - Create business (protected)
- `GET /api/business/:id` - Get single business (protected)
- `PUT /api/business/:id` - Update business (protected, owner only)
- `DELETE /api/business/:id` - Delete business (protected, owner only)

### Partners
- `GET /api/business/:id/partners` - Get all partners (protected)
- `POST /api/business/:id/partners` - Add partner (protected, owner only)
- `PUT /api/business/:id/partners/:partnerId` - Update partner role (protected, owner only)
- `DELETE /api/business/:id/partners/:partnerId` - Remove partner (protected, owner only)

### Transactions
- `GET /api/business/:id/transactions` - Get all transactions (protected)
- `POST /api/business/:id/transactions` - Create transaction (protected, editor/owner)
- `GET /api/business/:id/transactions/:transactionId` - Get single transaction (protected)
- `PUT /api/business/:id/transactions/:transactionId` - Update transaction (protected, editor/owner)
- `DELETE /api/business/:id/transactions/:transactionId` - Delete transaction (protected, editor/owner)

### Reports
- `GET /api/business/:id/reports` - Generate report (protected)
- `GET /api/business/:id/reports/stats` - Get statistics (protected)

## 👤 User Roles & Permissions

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| View business details | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ |
| Add transactions | ✅ | ✅ | ❌ |
| Edit transactions | ✅ | ✅ | ❌ |
| Delete transactions | ✅ | ✅ | ❌ |
| Add partners | ✅ | ❌ | ❌ |
| Remove partners | ✅ | ❌ | ❌ |
| Edit business details | ✅ | ❌ | ❌ |
| Delete business | ✅ | ❌ | ❌ |

## 📝 Usage Example

1. **Register** a new account
2. **Login** with your credentials
3. **Create** a new business from the dashboard
4. **Add partners** by entering their registered email addresses
5. **Add transactions** (income or expenses) with descriptions and amounts
6. **View reports** with visual charts and download as PDF/CSV
7. **Manage partners** and their roles as needed

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with MERN stack
- UI design inspired by modern dashboard patterns
- Charts powered by Recharts
- Styled with Tailwind CSS

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Made with ❤️ for small business owners**

