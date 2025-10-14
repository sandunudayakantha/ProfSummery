# 🚀 Deployment Guide - Vercel

This guide will help you deploy the Profit Summary App to Vercel with backend API routes.

## Prerequisites

- [Vercel Account](https://vercel.com) (free tier is sufficient)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (free tier is sufficient)
- [GitHub Account](https://github.com) with your code pushed
- Git repository with this project

## Step 1: Prepare MongoDB Atlas

### 1.1 Create a MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create a free account
3. Create a new cluster (M0 Free tier is perfect)
4. Wait for cluster creation (takes a few minutes)

### 1.2 Create Database User

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose authentication method: Password
4. Set username and strong password (save these!)
5. Set database user privileges to "Read and write to any database"
6. Click "Add User"

### 1.3 Whitelist IP Addresses

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

> **Note**: For production, you should whitelist only Vercel's IP addresses

### 1.4 Get Connection String

1. Go back to "Database" view
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `myFirstDatabase` with `profitsummary`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/profitsummary?retryWrites=true&w=majority`

## Step 2: Prepare Your Code Repository

### 2.1 Initialize Git (if not already)

```bash
cd /Users/sandunudayakantha/Documents/GitHub/Untitled/ProfSummery
git init
```

### 2.2 Add Remote Repository

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/profit-summary-app.git
```

### 2.3 Commit and Push

```bash
git add .
git commit -m "Initial commit - Profit Summary App"
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Select your repository from the list
5. Click "Import"

### 3.2 Configure Project

In the project configuration screen:

**Framework Preset**: Vite (it should auto-detect)

**Root Directory**: Leave as `./` (root)

**Build Command**:
```bash
cd frontend && npm install && npm run build
```

**Output Directory**: `frontend/dist`

**Install Command**:
```bash
npm run install:all
```

### 3.3 Configure Environment Variables

Click on "Environment Variables" and add the following:

| Name | Value | Notes |
|------|-------|-------|
| `MONGO_URI` | Your MongoDB connection string | From Step 1.4 |
| `JWT_SECRET` | Your secret key | Generate with command below |
| `NODE_ENV` | `production` | - |

**Generating JWT_SECRET:**
```bash
# Run this in your terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for deployment (usually 2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Step 4: Verify Deployment

### 4.1 Test Backend API

Visit: `https://your-project-name.vercel.app/api` 

You should see:
```json
{
  "success": true,
  "message": "Profit Summary API is running"
}
```

### 4.2 Test Frontend

1. Visit: `https://your-project-name.vercel.app`
2. Register a new account
3. Create a business
4. Add transactions
5. View reports

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain

1. Go to your project settings in Vercel
2. Click "Domains"
3. Enter your custom domain
4. Follow DNS configuration instructions

### 5.2 Update DNS

Add the following records to your DNS provider:
- Type: `A` Record, Name: `@`, Value: `76.76.21.21`
- Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

## Troubleshooting

### Build Fails

**Error**: "Cannot find module"
```bash
# Solution: Check package.json files exist in both backend and frontend
# Verify all dependencies are listed
```

**Error**: "Build timed out"
```bash
# Solution: Remove node_modules from git
git rm -r --cached node_modules
git rm -r --cached */node_modules
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "Remove node_modules"
git push
```

### MongoDB Connection Error

**Error**: "MongoServerError: bad auth"
- Check your MongoDB username and password
- Ensure special characters in password are URL-encoded

**Error**: "Connection timeout"
- Verify IP whitelist includes 0.0.0.0/0
- Check MongoDB cluster is active

### API Routes Not Working

**Error**: 404 on `/api/*` routes
- Verify `vercel.json` exists in root directory
- Check the routes configuration matches:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    }
  ]
}
```

### Frontend Not Loading

**Error**: Blank page
- Check browser console for errors
- Verify `VITE_API_URL` is not hardcoded to localhost
- Check Vercel deployment logs

## Environment Variables Reference

### Backend (.env file for local development)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/profitsummary
JWT_SECRET=your_generated_secret_key_here
```

### Vercel (Production Environment Variables)
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your secret key for JWT signing
- `NODE_ENV`: production

## Post-Deployment Checklist

- [ ] Backend API responds at `/api`
- [ ] Can register a new user
- [ ] Can login
- [ ] Can create a business
- [ ] Can add transactions
- [ ] Can generate reports
- [ ] Can download PDF/CSV
- [ ] Can add partners
- [ ] All role permissions work correctly

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel will automatically deploy
```

## Monitoring

### View Logs

1. Go to your project in Vercel dashboard
2. Click "Deployments"
3. Click on a deployment
4. Click "Functions" to see API logs

### View Analytics

1. Go to "Analytics" in Vercel dashboard
2. Monitor traffic, performance, and errors

## Scaling

The free tier includes:
- 100GB bandwidth/month
- 6,000 build minutes/month
- Unlimited API requests

For more traffic, upgrade to Pro plan ($20/month).

## Security Best Practices

1. **Use strong JWT secret** (minimum 64 characters)
2. **Enable MongoDB encryption** at rest
3. **Use environment variables** for all secrets
4. **Never commit .env files** to git
5. **Whitelist only necessary IPs** in MongoDB (after testing)
6. **Enable two-factor authentication** on Vercel and MongoDB
7. **Regularly rotate secrets** (JWT_SECRET, database passwords)

## Backup Strategy

### MongoDB Backups

1. MongoDB Atlas automatically backs up your data
2. Free tier includes snapshots
3. You can manually trigger backups in Atlas dashboard

### Code Backups

1. Your code is backed up on GitHub
2. Vercel keeps deployment history
3. You can roll back to previous deployments in Vercel dashboard

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review MongoDB Atlas logs
3. Check browser console for frontend errors
4. Review this deployment guide
5. Check the main README.md for API documentation

## Success! 🎉

Your Profit Summary App is now deployed and accessible worldwide!

**Next Steps:**
1. Share the URL with your team
2. Create your businesses
3. Invite partners
4. Start tracking your profits!

---

**Deployed with ❤️ on Vercel**

