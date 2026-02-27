import axios from 'axios'

// Dynamically determine API URL based on where the frontend is loaded from
// If localhost, use localhost:5000
// If 192.168.x.x, use 192.168.x.x:5000 (LAN)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const hostname = window.location.hostname
  return `http://${hostname}:5000/api`
}

const API_BASE_URL = getApiUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const expenseAPI = {
  // Expenses
  getAllExpenses: () => api.get('/expenses'),
  getExpenseById: (id) => api.get(`/expenses/${id}`),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getExpenseStats: () => api.get('/expenses/stats'),
  getExpenseTrend: () => api.get('/expenses/trend'),

  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (name) => api.post('/categories', { name }),

  // Budget
  getBudget: () => api.get('/budget'),
  updateBudget: (data) => api.put('/budget', data),

  // Reports
  getMonthlyReport: (month, year) => api.get(`/reports/monthly?month=${month}&year=${year}`),
  getCategoryReport: () => api.get('/reports/category')
}

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password })
}

export const aiAPI = {
  predict: () => api.get('/ai/predict')
}

export default api
