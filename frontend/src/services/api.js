import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

export default api
