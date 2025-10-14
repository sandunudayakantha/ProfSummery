# Login Navigation Debug Guide

## Issue
After entering credentials, the page is not navigating to the dashboard/create business page.

## Common Causes & Solutions

### 1. **No User Account Exists**
If you haven't registered yet, you need to create an account first.

**Solution:**
- Click on "create a new account" link on the login page
- OR go to: http://localhost:3004/register
- Fill in: Name, Email, Password
- Click "Register"

### 2. **Wrong Credentials**
If the email or password is incorrect, you'll see "Invalid credentials" error.

**Solution:**
- Make sure you're using the correct email and password
- Check for typos or extra spaces
- Password is case-sensitive

### 3. **Check Browser Console**
The login page now has detailed console logging to help debug.

**How to check:**
1. Open browser (Chrome/Firefox/Safari)
2. Press F12 or Right-click → Inspect
3. Go to "Console" tab
4. Try logging in again
5. Look for messages starting with "AuthContext:" or "Attempting login"

**What to look for:**
- ✅ "Login successful, navigating to dashboard..." = Good!
- ❌ "Login failed: Invalid credentials" = Wrong email/password
- ❌ "Error logging in" = Server issue
- ❌ Network errors = Backend not running

## Testing Your Setup

### Test 1: Check Backend is Running
```bash
curl http://localhost:5002/
```
Expected: `{"success":true,"message":"Profit Summary API is running"}`

### Test 2: Check Database Connection
Look at your backend terminal. You should see:
```
MongoDB Connected: localhost
```

### Test 3: Register a New User
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "currency": "USD",
    "token": "..."
  }
}
```

If you get "User already exists", use a different email.

### Test 4: Test Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected: Same response as registration (with token)

## Step-by-Step Login Process

1. **Open Application**: http://localhost:3004
2. **If no account**: Click "create a new account"
3. **Fill Registration Form**:
   - Name: Your Name
   - Email: your@email.com
   - Password: At least 6 characters
4. **Submit**: Click "Register"
5. **Automatic Login**: You should be automatically logged in and see dashboard

## After Successful Login

You should see one of these:

### A. No Businesses Yet
- Large emoji 📊
- Text: "No businesses yet"
- Button: "Create Your First Business"
- **Action**: Click the button to create your first business

### B. Existing Businesses
- Dashboard with statistics
- Business cards showing your businesses
- Button: "+ Create Business" (top right)

## Debugging Console Messages

### Good Flow:
```
Attempting login with: test@example.com
AuthContext: Calling login API...
AuthContext: API response received: {success: true, data: {...}}
AuthContext: Login successful, user set: {...}
Login result: {success: true}
Login successful, navigating to dashboard...
```

### Failed Login:
```
Attempting login with: test@example.com
AuthContext: Calling login API...
AuthContext: Login error: AxiosError {...}
AuthContext: Error response: {success: false, message: "Invalid credentials"}
Login result: {success: false, message: "Invalid credentials"}
Login failed: Invalid credentials
```

## Quick Test Credentials

If you just want to test, create a user through the UI:
1. Go to http://localhost:3004/register
2. Enter:
   - Name: Test User
   - Email: test@test.com
   - Password: test1234
3. Click Register
4. You'll be automatically logged in

## Still Not Working?

### Check Frontend Environment
```bash
cat frontend/.env
```
Should show: `VITE_API_URL=http://localhost:3004/api`

**Wait, that's wrong!** It should be:
```
VITE_API_URL=http://localhost:5002/api
```

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Try logging in
4. Look for "login" request
5. Click on it to see:
   - Request URL: Should be `http://localhost:5002/api/auth/login`
   - Status: Should be 200 (success) or 401 (wrong credentials)
   - Response: Check the JSON response

## Common Error Messages

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "Invalid credentials" | Wrong email or password | Check your credentials |
| "User already exists" | Email is registered | Use login instead of register |
| "Please provide email and password" | Empty fields | Fill all fields |
| "Could not connect to server" | Backend not running | Start backend: `cd backend && npm run dev` |
| "Network Error" | CORS or connection issue | Check backend is on port 5002 |

## Need More Help?

1. **Share Console Logs**: Copy all console messages when trying to login
2. **Share Network Tab**: Screenshot of the login request/response
3. **Backend Logs**: Check terminal where backend is running for errors
4. **Check MongoDB**: Ensure MongoDB is running: `pgrep mongod`

---

**Last Updated**: October 14, 2025

