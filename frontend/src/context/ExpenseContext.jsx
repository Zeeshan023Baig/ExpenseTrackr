import { createContext, useState, useCallback, useEffect } from 'react'
import { expenseAPI } from '../services/api'
import { useAuth } from './AuthContext'

export const ExpenseContext = createContext()

export const ExpenseProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([
    'Food',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Shopping',
    'Other'
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load expenses from API
  const fetchExpenses = useCallback(async () => {
    if (!isAuthenticated) {
      setExpenses([])
      return
    }

    setLoading(true)
    try {
      const response = await expenseAPI.getAllExpenses()
      setExpenses(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (err) {
      console.error('Error loading expenses:', err)
      setError('Failed to load expenses')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = useCallback(async (expenseData) => {
    setLoading(true)
    try {
      console.log('Adding expense:', expenseData)
      const response = await expenseAPI.createExpense(expenseData)
      setExpenses(prev => {
        const newExpenses = [response.data, ...prev]
        return newExpenses
      })
      return response.data
    } catch (err) {
      console.error('Error adding expense:', err)
      console.error('Server response:', err.response?.data)
      setError(err.response?.data?.message || 'Failed to add expense')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteExpense = useCallback(async (id) => {
    try {
      await expenseAPI.deleteExpense(id)
      setExpenses(prev => prev.filter(expense => expense.id !== id))
    } catch (err) {
      console.error('Error deleting expense:', err)
      setError('Failed to delete expense')
    }
  }, [])

  const updateExpense = useCallback(async (id, updates) => {
    try {
      const response = await expenseAPI.updateExpense(id, updates)
      setExpenses(prev =>
        prev.map(expense =>
          expense.id === id ? response.data : expense
        )
      )
    } catch (err) {
      console.error('Error updating expense:', err)
      setError('Failed to update expense')
    }
  }, [])

  const getExpensesByCategory = useCallback((category) => {
    if (!Array.isArray(expenses)) return []
    return expenses.filter(expense => expense.category === category)
  }, [expenses])

  const getTotalExpenses = useCallback(() => {
    if (!Array.isArray(expenses)) return 0
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }, [expenses])

  const getExpensesByDateRange = useCallback((startDate, endDate) => {
    if (!Array.isArray(expenses)) return []
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt || expense.date)
      return expenseDate >= startDate && expenseDate <= endDate
    })
  }, [expenses])

  const value = {
    expenses,
    categories,
    loading,
    error,
    addExpense,
    deleteExpense,
    updateExpense,
    getExpensesByCategory,
    getTotalExpenses,
    getExpensesByDateRange
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}
