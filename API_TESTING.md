# 🧪 API Testing Guide

This guide provides examples for testing all API endpoints using various tools.

## Base URL

- **Local Development**: `http://localhost:5000/api`
- **Production**: `https://your-app.vercel.app/api`

---

## Tools You Can Use

1. **cURL** (Command line)
2. **Postman** (GUI)
3. **Thunder Client** (VS Code extension)
4. **Insomnia** (GUI)
5. **httpie** (Command line)

---

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**💡 Save the token** - you'll need it for authenticated requests!

### 3. Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Business Management

### 1. Create a Business

```bash
curl -X POST http://localhost:5000/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Tech Startup Inc",
    "description": "A innovative tech company"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "business_id_here",
    "name": "Tech Startup Inc",
    "description": "A innovative tech company",
    "owner": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "partners": [
      {
        "user": "user_id",
        "role": "owner",
        "_id": "partner_id"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Businesses

```bash
curl -X GET http://localhost:5000/api/business \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get Single Business

```bash
curl -X GET http://localhost:5000/api/business/BUSINESS_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Update Business

```bash
curl -X PUT http://localhost:5000/api/business/BUSINESS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Updated Business Name",
    "description": "Updated description"
  }'
```

### 5. Delete Business

```bash
curl -X DELETE http://localhost:5000/api/business/BUSINESS_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Partner Management

### 1. Add a Partner

```bash
curl -X POST http://localhost:5000/api/business/BUSINESS_ID/partners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "partner@example.com",
    "role": "editor"
  }'
```

**Roles**: `editor` | `viewer`

### 2. Get All Partners

```bash
curl -X GET http://localhost:5000/api/business/BUSINESS_ID/partners \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Update Partner Role

```bash
curl -X PUT http://localhost:5000/api/business/BUSINESS_ID/partners/PARTNER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "role": "viewer"
  }'
```

### 4. Remove Partner

```bash
curl -X DELETE http://localhost:5000/api/business/BUSINESS_ID/partners/PARTNER_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Transaction Management

### 1. Create Income Transaction

```bash
curl -X POST http://localhost:5000/api/business/BUSINESS_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "income",
    "amount": 5000,
    "description": "Client payment for services",
    "date": "2024-01-15"
  }'
```

### 2. Create Expense Transaction

```bash
curl -X POST http://localhost:5000/api/business/BUSINESS_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "expense",
    "amount": 1200,
    "description": "Office rent payment",
    "date": "2024-01-01"
  }'
```

### 3. Get All Transactions

```bash
curl -X GET http://localhost:5000/api/business/BUSINESS_ID/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Transactions with Filters

```bash
# Filter by date range
curl -X GET "http://localhost:5000/api/business/BUSINESS_ID/transactions?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by type
curl -X GET "http://localhost:5000/api/business/BUSINESS_ID/transactions?type=income" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Single Transaction

```bash
curl -X GET http://localhost:5000/api/business/BUSINESS_ID/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Update Transaction

```bash
curl -X PUT http://localhost:5000/api/business/BUSINESS_ID/transactions/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 5500,
    "description": "Updated: Client payment with bonus"
  }'
```

### 7. Delete Transaction

```bash
curl -X DELETE http://localhost:5000/api/business/BUSINESS_ID/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Reports

### 1. Generate Report (Daily)

```bash
curl -X GET "http://localhost:5000/api/business/BUSINESS_ID/reports?period=daily" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Generate Report (Monthly)

```bash
curl -X GET "http://localhost:5000/api/business/BUSINESS_ID/reports?period=monthly" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Generate Report (Yearly)

```bash
curl -X GET "http://localhost:5000/api/business/BUSINESS_ID/reports?period=yearly" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Generate Custom Date Range Report

```bash
curl -X GET "http://localhost:5000/api/business/BUSINESS_ID/reports?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Business Statistics

```bash
curl -X GET http://localhost:5000/api/business/BUSINESS_ID/reports/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Collection

### Import This JSON

```json
{
  "info": {
    "name": "Profit Summary API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "business_id",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  }
}
```

---

## Testing Scenarios

### Scenario 1: Complete Business Setup

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# 2. Create Business
BUSINESS_ID=$(curl -s -X POST http://localhost:5000/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Business","description":"Testing"}' \
  | jq -r '.data._id')

# 3. Add Income
curl -X POST http://localhost:5000/api/business/$BUSINESS_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"income","amount":5000,"description":"Sale","date":"2024-01-15"}'

# 4. Add Expense
curl -X POST http://localhost:5000/api/business/$BUSINESS_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"expense","amount":1000,"description":"Rent","date":"2024-01-01"}'

# 5. Get Report
curl -X GET "http://localhost:5000/api/business/$BUSINESS_ID/reports?period=monthly" \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Partner Collaboration

```bash
# 1. Owner registers and creates business
OWNER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Owner","email":"owner@example.com","password":"password123"}' \
  | jq -r '.data.token')

BUSINESS_ID=$(curl -s -X POST http://localhost:5000/api/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"name":"Shared Business"}' \
  | jq -r '.data._id')

# 2. Partner registers
PARTNER_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Partner","email":"partner@example.com","password":"password123"}' \
  | jq -r '.data.token')

# 3. Owner adds partner
curl -X POST http://localhost:5000/api/business/$BUSINESS_ID/partners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{"email":"partner@example.com","role":"editor"}'

# 4. Partner can now add transactions
curl -X POST http://localhost:5000/api/business/$BUSINESS_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -d '{"type":"income","amount":3000,"description":"Partnership income","date":"2024-01-20"}'
```

---

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Detailed error (development only)"
}
```

---

## Testing Tips

### 1. Use Variables

Store commonly used values:
```bash
export BASE_URL="http://localhost:5000/api"
export TOKEN="your_token_here"
export BUSINESS_ID="your_business_id"
```

### 2. Format JSON Response

Use `jq` for pretty printing:
```bash
curl -X GET $BASE_URL/business \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. Save Response to File

```bash
curl -X GET $BASE_URL/business/$BUSINESS_ID/reports?period=yearly \
  -H "Authorization: Bearer $TOKEN" \
  -o report.json
```

### 4. Test Performance

```bash
time curl -X GET $BASE_URL/business \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Verbose Output

```bash
curl -v -X GET $BASE_URL/business \
  -H "Authorization: Bearer $TOKEN"
```

---

## Automated Testing Script

Save as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "🧪 Testing Profit Summary API"
echo "================================"

# Test 1: Health Check
echo -n "Testing health endpoint... "
if curl -s $BASE_URL | grep -q "success"; then
  echo "✅ PASSED"
else
  echo "❌ FAILED"
fi

# Test 2: Register
echo -n "Testing registration... "
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test$(date +%s)@example.com\",\"password\":\"password123\"}")

if echo $RESPONSE | grep -q "token"; then
  TOKEN=$(echo $RESPONSE | jq -r '.data.token')
  echo "✅ PASSED"
else
  echo "❌ FAILED"
  exit 1
fi

# Test 3: Create Business
echo -n "Testing business creation... "
RESPONSE=$(curl -s -X POST $BASE_URL/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Business"}')

if echo $RESPONSE | grep -q "_id"; then
  BUSINESS_ID=$(echo $RESPONSE | jq -r '.data._id')
  echo "✅ PASSED"
else
  echo "❌ FAILED"
fi

# Test 4: Add Transaction
echo -n "Testing transaction creation... "
RESPONSE=$(curl -s -X POST $BASE_URL/business/$BUSINESS_ID/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"income","amount":1000,"description":"Test","date":"2024-01-01"}')

if echo $RESPONSE | grep -q "success"; then
  echo "✅ PASSED"
else
  echo "❌ FAILED"
fi

echo "================================"
echo "✅ All tests completed!"
```

Make executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Happy Testing! 🚀

For more information, see:
- [README.md](./README.md) - Full documentation
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

