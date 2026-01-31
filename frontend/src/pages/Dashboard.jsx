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
<<<<<<< HEAD
    <div className="layout-container py-8 space-y-10">
=======
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2 tracking-tight"
        >
          Welcome Back! 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 font-medium"
        >
          Here's your expense overview for this month
        </motion.p>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpenses.toFixed(2)}`}
          icon={FiTrendingDown}
          color="blue"
        />
        <StatCard
          title="This Month"
          value={`₹${monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`}
          icon={FiCalendar}
          color="green"
        />
        <StatCard
          title="Average Expense"
          value={`₹${averageExpense}`}
          icon={FiLayout}
          color="purple"
        />
        <StatCard
          title="Top Category"
          value={topCategory}
          icon={FiArrowRight}
          color="red"
        />
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants}>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </motion.div>

      {/* Recent Expenses Section */}
>>>>>>> eb1ab328adf6e2b6f6b094e43cf207515300648c
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
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
            color="brand"
          />
          <StatCard
            title="This Month"
            value={`₹${monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}`}
            icon={FiCalendar}
            color="green"
          />
          <StatCard
            title="Average"
            value={`₹${averageExpense}`}
            icon={FiLayout}
            color="purple"
          />
          <StatCard
            title="Top Category"
            value={topCategory}
            icon={FiPieChart}
            color="red"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filter Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
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