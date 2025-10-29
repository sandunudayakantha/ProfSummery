# SPA Routing Fix for Vercel

## Problem:
- Frontend loads initially but shows 404 on refresh
- Routes like `/login` return 404 instead of serving the React app
- This is a common issue with Single Page Applications (SPA)

## Solution Applied:

### 1. Updated `frontend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Created `frontend/public/_redirects`:
```
/*    /index.html   200
```

### 3. Updated root `vercel.json` for combined deployment:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

## Deployment Options:

### Option 1: Deploy Both Together (Recommended)
1. Connect the root repository to Vercel
2. Use the root `vercel.json` configuration
3. Set build command: `npm run build`
4. Set output directory: `frontend/dist`

### Option 2: Deploy Separately
1. **Backend**: Use `backend/vercel.json`
2. **Frontend**: Use `frontend/vercel.json`

## Environment Variables:

### Backend:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Frontend:
```
VITE_API_URL=https://your-backend-app.vercel.app
```

## Testing:

After deployment:
1. Visit `https://your-app.vercel.app` - Should load
2. Navigate to `/login` - Should work
3. Refresh the page on `/login` - Should still work (no 404)
4. Test all routes: `/dashboard`, `/profile`, `/admin`, etc.

## How It Works:

- **`_redirects` file**: Tells Vercel to serve `index.html` for all routes
- **`vercel.json` routes**: Ensures all non-API routes serve the React app
- **React Router**: Handles client-side routing after the app loads

This fix ensures that:
- ✅ All routes work on first visit
- ✅ All routes work on refresh
- ✅ API calls go to the backend
- ✅ Frontend routes are handled by React Router
