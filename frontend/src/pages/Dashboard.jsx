import { useContext, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingDown, FiCalendar, FiLayout, FiArrowRight, FiPieChart } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { StatCard, ExpenseCard, EmptyState, CategoryFilter } from '../components'

const Dashboard = () => {
  const { expenses, categories, getTotalExpenses, getExpensesByCategory, deleteExpense } = useContext(ExpenseContext)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const totalExpenses = getTotalExpenses()

  const filteredExpenses = useMemo(() => {
    if (selectedCategory) {
      return getExpensesByCategory(selectedCategory)
    }
    return expenses
  }, [selectedCategory, expenses, getExpensesByCategory])

  const monthlyExpenses = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return expenses.filter(expense => new Date(expense.createdAt) >= startOfMonth)
  }, [expenses])

  const averageExpense = useMemo(() => {
    return expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : 0
  }, [expenses, totalExpenses])

  const topCategory = useMemo(() => {
    if (categories.length === 0) return 'N/A'
    const categoryCounts = categories.map(cat => ({
      name: cat,
      total: getExpensesByCategory(cat).reduce((sum, exp) => sum + exp.amount, 0)
    }))
    return categoryCounts.reduce((max, cur) => cur.total > max.total ? cur : max).name
  }, [categories, getExpensesByCategory])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="layout-container py-8 space-y-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
              Dashboard
            </h1>
            <p className="text-surface-500 mt-1">
              Overview of your financial activity.
            </p>
          </div>
          <div className="flex gap-3">
            {/* Action buttons could go here */}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toFixed(2)}`}
            icon={FiTrendingDown}
            color="red"
          />
          <StatCard
            title="This Month"
            value={`₹${monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`}
            icon={FiCalendar}
            color="blue"
          />
          <StatCard
            title="Average"
            value={`₹${averageExpense}`}
            icon={FiLayout}
            color="green"
          />
          <StatCard
            title="Top Category"
            value={topCategory}
            icon={FiPieChart}
            color="purple"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filter Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
            <div className="card p-5">
              <h3 className="font-bold text-surface-900 mb-4">Categories</h3>
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          </motion.div>

          {/* Recent Expenses Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-surface-900">
                {selectedCategory ? `${selectedCategory} Expenses` : 'Recent Transactions'}
              </h2>
            </div>

            {filteredExpenses.length === 0 ? (
              <EmptyState message={selectedCategory ? `No ${selectedCategory} expenses found` : 'No expenses yet. Start tracking!'} />
            ) : (
              <motion.div className="space-y-3">
                {[...filteredExpenses]
                  .reverse()
                  .slice(0, 5)
                  .map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ExpenseCard
                        expense={expense}
                        onEdit={() => { }}
                        onDelete={deleteExpense}
                      />
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard