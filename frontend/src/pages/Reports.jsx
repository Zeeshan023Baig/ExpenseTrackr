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
            <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Breakdown by Category
            </h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 0.6 }}
              className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            ></motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryBreakdown.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-3xl border-2 border-gray-200 shadow-lg p-6 bg-gradient-to-br from-white to-gray-50 group hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-400 rounded-full opacity-5"
                ></motion.div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl font-black text-indigo-600"
                    >
                      {category.count}
                    </motion.span>
                  </div>

                  <motion.p className="text-3xl font-black text-indigo-600 mb-2">
                    ₹{category.amount.toFixed(2)}
                  </motion.p>

                  {/* Progress Bar */}
                  <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.amount / totalExpenses) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    ></motion.div>
                  </div>

                  <p className="text-xs font-bold text-gray-600 mt-2 uppercase tracking-wider">
                    {((category.amount / totalExpenses) * 100).toFixed(1)}% of total
                  </p>
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
        <motion.div variants={itemVariants}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Monthly Trends
            </h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 0.6 }}
              className="h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
            ></motion.div>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyBreakdown.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg p-6 group hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-10 -right-10 w-24 h-24 bg-purple-400 rounded-full opacity-10"
                ></motion.div>

                <div className="relative z-10 text-center">
                  <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-2">
                    {new Date(data.month + '-01').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  <motion.p
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-2xl font-black text-purple-600"
                  >
                    ₹{data.amount.toFixed(2)}
                  </motion.p>
                </div>
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