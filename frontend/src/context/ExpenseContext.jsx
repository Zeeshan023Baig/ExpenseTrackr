// Forced redeploy for Vercel sync
import { createContext, useState, useCallback, useEffect } from 'react'
import { expenseAPI } from '../services/api'
import { useAuth } from './AuthContext'

export const ExpenseContext = createContext()

export const ExpenseProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(0)
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

  // Load data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setExpenses([])
      setBudget(0)
      return
    }

    setLoading(true)
    try {
      const [expensesRes, budgetRes] = await Promise.all([
        expenseAPI.getAllExpenses(),
        expenseAPI.getBudget()
      ])

      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : [])
      setBudget(budgetRes.data.budget || 0)

      // Dynamic Categories: Extract unique categories from existing expenses
      const existingCategories = expensesRes.data.map(e => e.category);
      const uniqueCategories = [...new Set([...categories, ...existingCategories])];
      setCategories(uniqueCategories.sort());

      setError(null)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateUserBudget = useCallback(async (amount) => {
    try {
      const response = await expenseAPI.updateBudget({ budget: amount })
      setBudget(response.data.budget)
      return response.data
    } catch (err) {
      console.error('Error updating budget:', err)
      throw err
    }
  }, [])

  // Expenses actions
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

  const addCategory = useCallback((category) => {
    setCategories(prev => {
      if (prev.includes(category)) return prev
      return [...prev, category]
    })
  }, [])

  const value = {
    expenses,
    budget,
    categories,
    loading,
    error,
    addExpense,
    deleteExpense,
    updateExpense,
    updateUserBudget,
    getExpensesByCategory,
    getTotalExpenses,
    getExpensesByDateRange,
    addCategory
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}
