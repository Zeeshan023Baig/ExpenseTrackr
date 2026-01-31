import { useContext, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi'
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="layout-container py-8 space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
            Expense Reports
          </h1>
          <p className="text-surface-500 mt-1">
            Visual analysis of your spending habits.
          </p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpenses.toFixed(2)}`}
          icon={FiBarChart2}
          color="brand"
        />
        <StatCard
          title="Total Transactions"
          value={expenses.length}
          icon={FiTrendingUp}
          color="green"
        />
        {highestExpense && (
          <StatCard
            title="Highest Expense"
            value={`₹${highestExpense.amount.toFixed(2)}`}
            icon={FiPieChart}
            color="red"
          />
        )}
      </motion.div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 ? (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-900">
              Breakdown by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryBreakdown.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-surface-900">{category.name}</h3>
                  <span className="bg-brand-500/20 text-brand-300 text-xs font-bold px-2.5 py-1 rounded-full border border-brand-500/20">
                    {category.count} txns
                  </span>
                </div>

                <p className="text-3xl font-bold text-brand-400 mb-4 drop-shadow-sm">
                  ₹{category.amount.toFixed(2)}
                </p>

                {/* Progress Bar */}
                <div className="relative w-full bg-surface-200/50 rounded-full h-2 overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(category.amount / totalExpenses) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                  ></motion.div>
                </div>

                <div className="flex justify-between items-center text-xs font-medium text-surface-400 mt-3">
                  <span>Contribution</span>
                  <span>{((category.amount / totalExpenses) * 100).toFixed(1)}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <EmptyState message="No category data available" />
      )}

      {/* Monthly Breakdown */}
      {monthlyBreakdown.length > 0 ? (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-900">
              Monthly Trends
            </h2>
          </div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {monthlyBreakdown.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6 flex flex-col justify-between"
              >
                <p className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent uppercase tracking-wider mb-2">
                  {new Date(data.month + '-01').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
                <p className="text-3xl font-bold text-surface-900 tracking-tight">
                  ₹{data.amount.toFixed(2)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <EmptyState message="No monthly data available" />
      )}
    </motion.div>
  )
}

export default Reports