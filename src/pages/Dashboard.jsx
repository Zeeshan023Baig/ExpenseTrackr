import { useContext, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingDown, FiCalendar, FiLayout } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { StatCard, ExpenseCard, EmptyState, CategoryFilter } from '../components'
import { useState } from 'react'

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stats Section */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          color="red"
        />
      </motion.div>

      {/* Filter Section */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Recent Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedCategory ? `${selectedCategory} Expenses` : 'Recent Expenses'}
        </h2>

        {filteredExpenses.length === 0 ? (
          <EmptyState message={selectedCategory ? `No ${selectedCategory} expenses found` : 'No expenses yet. Start tracking!'} />
        ) : (
          <div className="space-y-3">
            {[...filteredExpenses]
              .reverse()
              .slice(0, 5)
              .map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={() => {}}
                  onDelete={deleteExpense}
                />
              ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default Dashboard
