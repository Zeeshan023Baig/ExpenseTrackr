import { useContext, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiBarChart2, FiPieChart } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { StatCard, EmptyState } from '../components'

const Reports = () => {
  const { expenses, categories, getExpensesByCategory } = useContext(ExpenseContext)

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [expenses])

  const categoryBreakdown = useMemo(() => {
    return categories
      .map(cat => ({
        name: cat,
        amount: getExpensesByCategory(cat).reduce((sum, exp) => sum + exp.amount, 0),
        count: getExpensesByCategory(cat).length
      }))
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [categories, getExpensesByCategory])

  const monthlyBreakdown = useMemo(() => {
    const months = {}
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months[monthKey] = (months[monthKey] || 0) + expense.amount
    })
    return Object.entries(months)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [expenses])

  const highestExpense = useMemo(() => {
    return expenses.length > 0
      ? expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max)
      : null
  }, [expenses])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Analyze your spending patterns</p>
      </motion.div>

      {expenses.length === 0 ? (
        <EmptyState message="No data available. Start tracking expenses to see reports!" />
      ) : (
        <>
          {/* Key Stats */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Spent"
              value={`₹${totalExpenses.toFixed(2)}`}
              icon={FiBarChart2}
              color="blue"
            />
            <StatCard
              title="Total Transactions"
              value={expenses.length.toString()}
              icon={FiPieChart}
              color="green"
            />
            <StatCard
              title="Average Expense"
              value={`₹${(totalExpenses / expenses.length).toFixed(2)}`}
              color="purple"
            />
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Category Breakdown</h2>
            <div className="space-y-4">
              {categoryBreakdown.map((cat, index) => {
                const percentage = ((cat.amount / totalExpenses) * 100).toFixed(1)
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{cat.name}</span>
                      <span className="text-sm text-gray-500">{cat.count} transactions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.2 + index * 0.05, duration: 0.8 }}
                        className="bg-blue-500 h-3 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">₹{cat.amount.toFixed(2)}</span>
                      <span className="text-sm font-semibold text-blue-600">{percentage}%</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Monthly Breakdown */}
          {monthlyBreakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Breakdown</h2>
              <div className="space-y-3">
                {monthlyBreakdown.map((item, index) => {
                  const maxAmount = Math.max(...monthlyBreakdown.map(m => m.amount))
                  const percentage = (item.amount / maxAmount) * 100
                  return (
                    <motion.div
                      key={item.month}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{item.month}</span>
                        <span className="font-bold text-green-600">₹{item.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.2 + index * 0.05, duration: 0.8 }}
                          className="bg-green-500 h-2 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Highest Expense */}
          {highestExpense && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-l-4 border-red-500"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Highest Expense</h3>
              <p className="text-2xl font-bold text-red-600">₹{highestExpense.amount.toFixed(2)}</p>
              <p className="text-gray-600 mt-1">{highestExpense.description}</p>
              <p className="text-sm text-gray-500 mt-2">{highestExpense.category}</p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}

export default Reports
