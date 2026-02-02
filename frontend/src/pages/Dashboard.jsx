import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiTrendingDown, FiCalendar, FiLayout, FiArrowRight, FiPieChart, FiPlus, FiCoffee, FiTruck, FiFilm, FiZap, FiActivity, FiShoppingBag, FiGrid } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { StatCard, ExpenseCard, EmptyState, CategoryFilter } from '../components'

const Dashboard = () => {
  const { expenses, categories, budget, getTotalExpenses, getExpensesByCategory, deleteExpense } = useContext(ExpenseContext)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const totalExpenses = getTotalExpenses()

  const filteredExpenses = useMemo(() => {
    const result = selectedCategory
      ? getExpensesByCategory(selectedCategory)
      : expenses;

    // Sort by createdAt DESC (Recent Added First)
    return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
              Overview of your financial activity
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/add" className="btn btn-primary shadow-glow flex items-center gap-2">
              <FiPlus /> Add Expense
            </Link>
          </div>
        </motion.div>

        {/* Budget Overview Bar */}
        <motion.div variants={itemVariants} className="card p-6 border-l-4 border-l-brand-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiPieChart size={80} />
          </div>
          <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Monthly Budget</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-surface-900">₹{totalExpenses.toFixed(0)}</span>
                <span className="text-surface-500 font-medium">of ₹{budget.toFixed(0)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${totalExpenses > budget ? 'text-red-500' : 'text-brand-600 dark:text-brand-400'}`}>
                {((totalExpenses / budget) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden relative z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalExpenses / budget) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full shadow-lg ${totalExpenses > budget
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-brand-500 to-purple-500'
                }`}
            />
          </div>
          {totalExpenses > budget && (
            <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              You have exceeded your budget!
            </p>
          )}
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
            icon={(() => {
              const icons = {
                Food: FiCoffee,
                Transportation: FiTruck,
                Entertainment: FiFilm,
                Utilities: FiZap,
                Healthcare: FiActivity,
                Shopping: FiShoppingBag,
                Other: FiGrid
              }
              return icons[topCategory] || FiPieChart
            })()}
            color="purple"
          />
        </motion.div>


        {/* Recent Expenses Section (Full Width now) */}
        <motion.div variants={itemVariants} className="space-y-6">
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
      </motion.div>
    </div>
  )
}

export default Dashboard