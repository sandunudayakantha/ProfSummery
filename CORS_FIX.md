# CORS Error Fix for Vercel Deployment

## Problem:
- CORS error: `Access to XMLHttpRequest at 'https://prof-summery.vercel.app/api/auth/login' from origin 'https://prof-summery-gax2.vercel.app' has been blocked by CORS policy`
- Frontend can't communicate with backend due to CORS restrictions

## Solution Applied:

### 1. Updated Backend CORS Configuration:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://prof-summery-gax2.vercel.app',
        'https://prof-summery-gax2.vercel.app',
        'https://prof-summery.vercel.app',
        'https://prof-summery-blqf.vercel.app'
      ]
    : [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://127.0.0.1:5173'
      ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## Required Actions:

### 1. Update Backend Environment Variables in Vercel:
Go to your backend project in Vercel dashboard and add/update:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://your-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://prof-summery-gax2.vercel.app
```

### 2. Update Frontend Environment Variables in Vercel:
Go to your frontend project in Vercel dashboard and add/update:
```
VITE_API_URL=https://prof-summery.vercel.app
```

### 3. Redeploy Both Projects:
1. **Backend**: Redeploy the backend project
2. **Frontend**: Redeploy the frontend project

## Testing:

### Backend Health Check:
- `https://prof-summery.vercel.app/` - Should return API status
- `https://prof-summery.vercel.app/health` - Should return health status
- `https://prof-summery.vercel.app/api/auth/login` - Should return login endpoint

### Frontend:
- `https://prof-summery-gax2.vercel.app` - Should load without CORS errors
- Try logging in - Should work without CORS errors

## If Issues Persist:

### Check Backend Logs:
1. Go to Vercel dashboard
2. Select your backend project
3. Go to "Functions" tab
4. Check logs for any errors

### Test API Directly:
```bash
curl https://prof-summery.vercel.app/
curl https://prof-summery.vercel.app/health
curl -X POST https://prof-summery.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Check CORS Headers:
```bash
curl -H "Origin: https://prof-summery-gax2.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://prof-summery.vercel.app/api/auth/login
```

## Expected Results:

- ✅ No CORS errors in browser console
- ✅ Login requests work properly
- ✅ All API calls succeed
- ✅ Frontend and backend communicate correctly

## Troubleshooting:

1. **CORS still failing**: Check that environment variables are set correctly
2. **API not responding**: Check backend logs in Vercel dashboard
3. **Frontend not loading**: Check frontend build logs
4. **Environment variables not working**: Verify they're set in Vercel dashboard, not just locally
