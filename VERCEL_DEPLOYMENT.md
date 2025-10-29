# Vercel Deployment Guide

## Project Structure
```
/
├── backend/           # Node.js/Express API
├── frontend/          # React/Vite Frontend
├── vercel.json        # Vercel configuration
├── package.json       # Root package.json
└── README.md
```

## Deployment Steps

### 1. Environment Variables

#### Frontend (.env in frontend directory):
```
VITE_API_URL=https://your-app.vercel.app/api
```

#### Backend (Set in Vercel Dashboard):
```
NODE_ENV=production
MONGO_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-app.vercel.app
```

### 2. Vercel Configuration

The `vercel.json` file is already configured to:
- Deploy backend as serverless functions
- Deploy frontend as static site
- Route `/api/*` to backend
- Route everything else to frontend

### 3. Deployment Commands

#### Local Development:
```bash
npm run install:all  # Install all dependencies
npm run dev          # Start both frontend and backend
```

#### Production Build:
```bash
npm run build        # Build frontend for production
```

### 4. Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `frontend/dist`
4. Add all environment variables
5. Deploy!

### 5. Important Notes

- Backend runs as Vercel serverless functions
- 10-second execution limit (should be fine for this app)
- Cold starts may occur on first request
- File uploads handled by Cloudinary
- Database connections managed by MongoDB Atlas

### 6. Testing

After deployment:
1. Check API health: `https://your-app.vercel.app/api`
2. Test frontend: `https://your-app.vercel.app`
3. Verify all features work correctly

## Troubleshooting

- If API calls fail, check CORS configuration
- If build fails, ensure all dependencies are installed
- If environment variables don't work, check Vercel dashboard settings
