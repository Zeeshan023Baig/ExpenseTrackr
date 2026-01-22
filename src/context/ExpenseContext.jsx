import { createContext, useState, useCallback, useEffect } from 'react'

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

  // Load expenses from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses')
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses))
      } catch (err) {
        console.error('Error loading expenses:', err)
      }
    }
  }, [])

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  const addExpense = useCallback((expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    setExpenses(prev => [...prev, newExpense])
    return newExpense
  }, [])

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id))
  }, [])

  const updateExpense = useCallback((id, updates) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      )
    )
  }, [])

  const getExpensesByCategory = useCallback((category) => {
    return expenses.filter(expense => expense.category === category)
  }, [expenses])

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }, [expenses])

  const getExpensesByDateRange = useCallback((startDate, endDate) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.createdAt)
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
