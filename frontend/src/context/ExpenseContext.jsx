import { createContext, useState, useCallback, useEffect } from 'react'
import { expenseAPI } from '../services/api'

export const ExpenseContext = createContext()

export const ExpenseProvider = ({ children }) => {
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
    setLoading(true)
    try {
      const response = await expenseAPI.getAllExpenses()
      setExpenses(response.data)
      setError(null)
    } catch (err) {
      console.error('Error loading expenses:', err)
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = useCallback(async (expenseData) => {
    setLoading(true)
    try {
      const response = await expenseAPI.createExpense(expenseData)
      setExpenses(prev => [response.data, ...prev])
      return response.data
    } catch (err) {
      console.error('Error adding expense:', err)
      setError('Failed to add expense')
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
    return expenses.filter(expense => expense.category === category)
  }, [expenses])

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }, [expenses])

  const getExpensesByDateRange = useCallback((startDate, endDate) => {
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
