# Environment Variables Template

This file contains templates for all environment variables needed for the Profit Summary App.

## ⚠️ IMPORTANT

- **NEVER** commit `.env` files to version control
- **ALWAYS** use strong, random values for secrets in production
- **CHANGE** all default values before deploying

---

## Backend Environment Variables

Create a file: `backend/.env`

```env
# Node Environment
NODE_ENV=development

# Server Port
PORT=5000

# MongoDB Connection
# Get this from MongoDB Atlas: https://www.mongodb.com/cloud/atlas
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?options
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/profitsummary?retryWrites=true&w=majority

# JWT Secret Key
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# MUST be a long, random string (minimum 32 characters, recommended 64+)
JWT_SECRET=your_very_long_random_secret_key_here_change_this_in_production
```

---

## Frontend Environment Variables (Optional)

Create a file: `frontend/.env`

```env
# API Base URL
# For local development
VITE_API_URL=http://localhost:5000/api

# For production (Vercel will use /api automatically, so this is optional)
# VITE_API_URL=https://your-app.vercel.app/api
```

> **Note**: The frontend uses `/api` as default if `VITE_API_URL` is not set, which works perfectly on Vercel.

---

## Production Environment Variables (Vercel)

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Required Variables

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.net/profitsummary` | MongoDB connection string from Atlas |
| `JWT_SECRET` | `64_character_random_string` | Secret key for JWT tokens |
| `NODE_ENV` | `production` | Node environment setting |

### Optional Variables

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `PORT` | `5000` | Server port (Vercel handles this) |

---

## How to Get Each Value

### MONGO_URI

1. **Sign up** for MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. **Create** a free cluster (M0 tier)
3. **Create** a database user (Database Access → Add New User)
4. **Whitelist** IP: 0.0.0.0/0 (Network Access → Add IP Address)
5. **Get connection string**: 
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace database name with `profitsummary`

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/profitsummary?retryWrites=true&w=majority
```

### JWT_SECRET

**Option 1: Generate with Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2: Generate with OpenSSL**
```bash
openssl rand -hex 64
```

**Option 3: Use Online Generator**
- Visit: https://www.grc.com/passwords.htm
- Use the 63 random alpha-numeric characters

**Example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

> ⚠️ **NEVER use the example above** - always generate your own!

---

## Environment-Specific Configurations

### Development (Local)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://devuser:devpass@dev-cluster.mongodb.net/profitsummary_dev
JWT_SECRET=development_secret_minimum_32_chars
```

### Staging (Optional)

```env
NODE_ENV=staging
PORT=5000
MONGO_URI=mongodb+srv://staginguser:stagingpass@staging-cluster.mongodb.net/profitsummary_staging
JWT_SECRET=staging_secret_different_from_production
```

### Production (Vercel)

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://produser:strongpass@prod-cluster.mongodb.net/profitsummary
JWT_SECRET=production_secret_very_long_and_random_64plus_characters
```

---

## Security Best Practices

### ✅ DO

- Use different secrets for development and production
- Use MongoDB users with minimum required permissions
- Generate strong, random JWT secrets (64+ characters)
- Rotate secrets periodically (every 90 days)
- Use environment variables for ALL secrets
- Keep .env files in .gitignore

### ❌ DON'T

- Commit .env files to git
- Use the same secrets across environments
- Use weak or predictable secrets
- Share secrets in plain text (use password managers)
- Hardcode secrets in your code
- Use default or example values in production

---

## Verifying Environment Variables

### Test MongoDB Connection

```javascript
// test-mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
```

Run: `node test-mongo.js`

### Test JWT Secret

```javascript
// test-jwt.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  console.error('❌ JWT_SECRET is too short or missing!');
  process.exit(1);
}

const token = jwt.sign({ test: true }, secret);
const decoded = jwt.verify(token, secret);

console.log('✅ JWT_SECRET is valid and working!');
console.log('Token length:', token.length);
```

Run: `node test-jwt.js`

---

## Troubleshooting

### "MONGO_URI is not defined"

**Solution**: 
1. Check `.env` file exists in `backend/` directory
2. Verify `dotenv` is loaded: `require('dotenv').config()`
3. Restart your server after creating `.env`

### "Invalid MONGO_URI"

**Solution**:
1. Check for spaces in the connection string
2. Ensure password special characters are URL-encoded:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`
   - `#` → `%23`

### "JWT malformed" or "Invalid signature"

**Solution**:
1. Ensure JWT_SECRET is the same in all instances
2. Clear localStorage and login again
3. Check JWT_SECRET has no trailing spaces

---

## Quick Setup Commands

```bash
# 1. Create .env files
touch backend/.env
touch frontend/.env

# 2. Generate JWT secret and copy it
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. Edit .env files (use your favorite editor)
nano backend/.env

# 4. Verify .env is in .gitignore
grep -q "\.env" .gitignore && echo "✅ .env is ignored" || echo "❌ Add .env to .gitignore"
```

---

## Template Checklist

Before deploying, ensure you have:

- [ ] Created `backend/.env` file
- [ ] Set valid `MONGO_URI` from MongoDB Atlas
- [ ] Generated strong `JWT_SECRET` (64+ characters)
- [ ] Set `NODE_ENV=production` in Vercel
- [ ] Verified .env is in .gitignore
- [ ] Tested MongoDB connection locally
- [ ] Tested JWT generation locally
- [ ] Added environment variables to Vercel dashboard
- [ ] Never committed .env files to git

---

**Ready to deploy? Check DEPLOYMENT.md for step-by-step instructions!**

