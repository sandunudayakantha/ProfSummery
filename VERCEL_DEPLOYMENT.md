# Vercel Deployment Guide

## Project Structure
```
/
├── backend/           # Node.js/Express API
├── frontend/          # React/Vite Frontend
├── vercel.json        # Root Vercel configuration
├── package.json       # Root package.json
└── README.md
```

## Deployment Strategy

### Option 1: Deploy Backend and Frontend Separately (Recommended)

#### Backend Deployment:
1. Create a new Vercel project for backend
2. Connect the `backend/` folder
3. Use the `backend/vercel.json` configuration
4. Set environment variables in Vercel dashboard

#### Frontend Deployment:
1. Create a new Vercel project for frontend
2. Connect the `frontend/` folder
3. Use the `frontend/vercel.json` configuration
4. Set build command: `npm run build`
5. Set output directory: `dist`

### Option 2: Deploy Both from Root (Alternative)

1. Connect the root repository to Vercel
2. Use the root `vercel.json` configuration
3. Set build command: `npm run build`
4. Set output directory: `frontend/dist`

## Environment Variables

### Backend (Set in Vercel Dashboard):
```
NODE_ENV=production
MONGO_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Frontend (.env in frontend directory):
```
VITE_API_URL=https://your-backend-app.vercel.app
```

## Deployment Steps

### For Backend:
1. Go to Vercel dashboard
2. Click "New Project"
3. Import your repository
4. Set root directory to `backend`
5. Vercel will automatically detect the `vercel.json`
6. Add environment variables
7. Deploy!

### For Frontend:
1. Go to Vercel dashboard
2. Click "New Project"
3. Import your repository
4. Set root directory to `frontend`
5. Set build command: `npm run build`
6. Set output directory: `dist`
7. Add environment variables
8. Deploy!

## Testing

After deployment:
1. Backend API: `https://your-backend-app.vercel.app/`
2. Frontend: `https://your-frontend-app.vercel.app`
3. Test API endpoints: `https://your-backend-app.vercel.app/api/auth/login`

## Troubleshooting

- **404 Error**: Check that `vercel.json` is in the correct directory
- **Build Error**: Ensure all dependencies are in `package.json`
- **CORS Error**: Update `FRONTEND_URL` environment variable
- **API Not Found**: Check that routes are properly configured in `vercel.json`
