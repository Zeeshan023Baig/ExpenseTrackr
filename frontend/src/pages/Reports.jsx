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
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Expense Reports
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 140 }}
          transition={{ duration: 0.6 }}
          className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
        ></motion.div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpenses.toFixed(2)}`}
          icon={FiBarChart2}
          color="blue"
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
            color="purple"
          />
        )}
      </motion.div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 ? (
        <motion.div variants={itemVariants}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              Breakdown by Category
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryBreakdown.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-indigo-100/50 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-700">{category.name}</h3>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                    {category.count} txns
                  </span>
                </div>

                <p className="text-3xl font-black text-gray-900 mb-4">
                  ₹{category.amount.toFixed(2)}
                </p>

                {/* Progress Bar */}
                <div className="relative w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(category.amount / totalExpenses) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                  ></motion.div>
                </div>

                <p className="text-xs font-bold text-gray-400 mt-2 text-right">
                  {((category.amount / totalExpenses) * 100).toFixed(1)}% of total
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <EmptyState message="No category data available" />
      )}

      {/* Monthly Breakdown */}
      {monthlyBreakdown.length > 0 ? (
        <motion.div variants={itemVariants}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              Monthly Trends
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyBreakdown.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-purple-100/50 group hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300"
              >
                <div className="relative z-10 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {new Date(data.month + '-01').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  <p className="text-2xl font-black text-gray-900">
                    ₹{data.amount.toFixed(2)}
                  </p>
                </div>

                {/* Decorative bottom bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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