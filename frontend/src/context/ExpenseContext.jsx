// Forced redeploy for Vercel sync
import { createContext, useState, useCallback, useEffect } from 'react'
import { expenseAPI } from '../services/api'
import { useAuth } from './AuthContext'

export const ExpenseContext = createContext()

export const ExpenseProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(0)
  const [categories, setCategories] = useState([])
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
      const [expensesRes, budgetRes, categoriesRes] = await Promise.all([
        expenseAPI.getAllExpenses(),
        expenseAPI.getBudget(),
        expenseAPI.getCategories()
      ])

      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : [])
      setBudget(budgetRes.data.budget || 0)
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])

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

  const addCategory = useCallback(async (name) => {
    try {
      const response = await expenseAPI.createCategory(name)
      setCategories(prev => [...new Set([...prev, response.data.name])])
      return response.data
    } catch (err) {
      console.error('Error adding category:', err)
      throw err
    }
  }, [])

  const removeCategory = useCallback(async (name) => {
    try {
      await expenseAPI.deleteCategory(name)
      setCategories(prev => prev.filter(c => c !== name))
    } catch (err) {
      console.error('Error removing category:', err)
      throw err
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
      const expenseDate = new Date(expense.date || expense.createdAt)
      return expenseDate >= startDate && expenseDate <= endDate
    })
  }, [expenses])


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
    addCategory,
    removeCategory,
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
