# 🔌 Backend Integration Guide

## Overview

The ExpenseTrackr frontend is fully ready to connect to a backend API. This guide shows how to set it up.

---

## Step 1: Configure Environment Variables

Edit `.env.local` in the project root:

```
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE_MODE=true
```

For production:
```
VITE_API_URL=https://api.example.com
VITE_ENV=production
```

---

## Step 2: API Endpoints

Implement these endpoints on your backend:

### Expenses

```http
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/stats
```

#### Response Format (GET /api/expenses)
```json
{
  "data": [
    {
      "id": "1234567890",
      "description": "Lunch at restaurant",
      "amount": 25.50,
      "category": "Food",
      "createdAt": "2026-01-22T15:30:00Z"
    }
  ]
}
```

#### Request Format (POST /api/expenses)
```json
{
  "description": "Lunch at restaurant",
  "amount": 25.50,
  "category": "Food"
}
```

### Categories

```http
GET    /api/categories
POST   /api/categories
```

### Budget

```http
GET    /api/budget
PUT    /api/budget
```

### Reports

```http
GET    /api/reports/monthly?month=01&year=2026
GET    /api/reports/category
```

---

## Step 3: Authentication (Optional)

### Setup JWT Token

1. **Login Endpoint** (not included in frontend, add it)
```http
POST /api/auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "email": "user@example.com"
  }
}
```

2. **Token is automatically included**
   - The API client in `src/services/api.js` automatically adds the token:
   ```js
   Authorization: Bearer <token>
   ```

3. **Store Token** (in your login page)
```js
localStorage.setItem('authToken', response.data.token)
```

---

## Step 4: Switch from LocalStorage to API

### Current Flow (LocalStorage)
```
Component → Context → LocalStorage
```

### Backend Flow
```
Component → Context → API Service → Backend
```

### How to Switch

The infrastructure is already in place! Just enable it:

**Option 1: Keep LocalStorage (Current)**
- Works without backend
- Good for offline-first approach
- Data stored locally in browser

**Option 2: Use Backend API**
- Update `.env.local` with API URL
- API service will handle requests automatically
- Remove localStorage syncing if desired

---

## Step 5: Error Handling

The Axios client already handles common errors:

```js
// 401 - Unauthorized (auto-redirects to login)
// 400 - Bad Request
// 500 - Server Error
// Network errors
```

The frontend will show toast notifications for all errors.

---

## Step 6: Test API Connection

### In Browser Console
```js
import { expenseAPI } from '@/services/api'

// Test API connection
expenseAPI.getAllExpenses()
  .then(res => console.log('Success:', res.data))
  .catch(err => console.error('Error:', err))
```

---

## Complete Backend Implementation Example

### Node.js/Express Example

```js
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  // Verify token logic
  next()
}

// Endpoints
app.get('/api/expenses', verifyToken, (req, res) => {
  // Fetch expenses from database
  res.json({ data: expenses })
})

app.post('/api/expenses', verifyToken, (req, res) => {
  const { description, amount, category } = req.body
  
  // Validate
  if (!description || !amount) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  
  // Save to database
  const expense = { id: Date.now(), description, amount, category, createdAt: new Date() }
  
  res.json({ data: expense })
})

app.put('/api/expenses/:id', verifyToken, (req, res) => {
  // Update logic
})

app.delete('/api/expenses/:id', verifyToken, (req, res) => {
  // Delete logic
})

app.listen(5000, () => console.log('Server running on port 5000'))
```

---

## Environment-Specific Behavior

### Development Mode
```
VITE_API_URL=http://localhost:5000/api
// Uses local backend
```

### Production Mode
```
VITE_API_URL=https://api.example.com
// Uses production backend
```

---

## CORS Configuration

If your backend is on a different domain, enable CORS:

### Express
```js
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

---

## Data Sync Strategy

### Option 1: Online-First
- Always use API
- No offline capability
- Simpler implementation

```js
// In your component
const expenses = await expenseAPI.getAllExpenses()
```

### Option 2: Offline-First (Current)
- Use LocalStorage as primary
- Sync with API when available
- Works offline

```js
// Current implementation
// Changes saved to LocalStorage immediately
// API sync can be added separately
```

---

## API Response Error Handling

The frontend already handles:

```js
try {
  const result = await expenseAPI.addExpense(data)
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 400) {
    // Show validation error
  } else if (error.response?.status === 500) {
    // Show server error
  }
}
```

---

## Debugging API Issues

### 1. Check Network Tab
- Open DevTools (F12)
- Go to Network tab
- Make an action (add expense)
- See the request/response

### 2. Check Console Errors
```js
// Add logging in api.js
console.log('Request:', config)
console.log('Response:', response.data)
console.log('Error:', error)
```

### 3. Check Environment Variables
```js
console.log(import.meta.env.VITE_API_URL)
```

### 4. Test API Manually
```bash
# Using curl
curl -H "Authorization: Bearer token123" \
  http://localhost:5000/api/expenses
```

---

## Database Schema Example

### Expenses Table
```sql
CREATE TABLE expenses (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### Categories Table
```sql
CREATE TABLE categories (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

---

## Deployment

### Backend
- Deploy to Heroku, AWS, DigitalOcean, etc.
- Get production API URL

### Frontend
1. Update `.env.local` with production API URL
2. Run `npm run build`
3. Deploy `dist/` folder

---

## Troubleshooting

### API requests failing?
- ✅ Check `.env.local` API URL
- ✅ Verify backend is running
- ✅ Check CORS settings
- ✅ Look at Network tab in DevTools

### 401 Unauthorized?
- ✅ Check if token is in localStorage
- ✅ Verify token is still valid
- ✅ Check Authorization header format

### 400 Bad Request?
- ✅ Check request data format
- ✅ Validate required fields
- ✅ Check data types

### No response from API?
- ✅ Verify backend URL is correct
- ✅ Check if backend is running
- ✅ Check network connectivity
- ✅ Check CORS headers

---

## Migration from LocalStorage to API

### Step 1: Add API Service
```js
import { expenseAPI } from '@/services/api'
```

### Step 2: Replace Context Methods
```js
// Before (LocalStorage)
addExpense(expense)

// After (API)
const newExpense = await expenseAPI.createExpense(expense)
```

### Step 3: Update Component Logic
```js
// Handle loading state
const [loading, setLoading] = useState(false)

// Wrap in try-catch
try {
  setLoading(true)
  const result = await expenseAPI.addExpense(data)
  setExpenses([...expenses, result])
} catch (error) {
  toast.error('Failed to add expense')
} finally {
  setLoading(false)
}
```

---

## Next Steps

1. ✅ Choose backend technology
2. ✅ Set up database
3. ✅ Implement API endpoints
4. ✅ Configure CORS
5. ✅ Test API with Postman
6. ✅ Connect frontend
7. ✅ Test end-to-end
8. ✅ Deploy

---

## Resources

- [Axios Documentation](https://axios-http.com/)
- [Express.js Guide](https://expressjs.com/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [JWT Authentication](https://jwt.io/)

---

**Ready to build your backend!** 🚀
