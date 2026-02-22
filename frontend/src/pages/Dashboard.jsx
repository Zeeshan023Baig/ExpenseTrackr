import { useContext, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiTrendingDown, FiCalendar, FiLayout, FiPieChart, FiPlus, FiCoffee, FiTruck, FiFilm, FiZap, FiActivity, FiShoppingBag, FiGrid, FiHelpCircle } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { StatCard, ExpenseCard, EmptyState } from '../components'
import { useTour } from '../hooks/useTour'

const Dashboard = () => {
  const { expenses, categories, budget, getTotalExpenses, getExpensesByCategory, deleteExpense, updateExpense } = useContext(ExpenseContext)
  const { startTour } = useTour()

  // Start tour on mount with a small delay to ensure DOM is ready
  useEffect(() => {
    if (!localStorage.getItem('has-seen-dashboard-tour')) {
      const timer = setTimeout(() => {
        startTour()
        localStorage.setItem('has-seen-dashboard-tour', 'true')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [startTour])

  const totalExpenses = getTotalExpenses()

  const recentExpenses = useMemo(() => {
    // Sort by date DESC (User-selected date first, fallback to createdAt)
    return [...expenses].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [expenses])

  const monthlyExpenses = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    return expenses.filter(expense => {
      const d = new Date(expense.date || expense.createdAt)
      return d >= startOfMonth && d <= endOfMonth
    })
  }, [expenses])

  const totalMonthlyExpenses = useMemo(() => {
    return monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [monthlyExpenses])

  const averageExpense = useMemo(() => {
    return expenses.length > 0 ? (getTotalExpenses() / expenses.length).toFixed(2) : 0
  }, [expenses, getTotalExpenses])

  const topCategory = useMemo(() => {
    if (categories.length === 0) return 'N/A'
    const categoryCounts = categories.map(cat => ({
      name: cat,
      total: expenses
        .filter(exp => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0)
    }))
    const max = categoryCounts.reduce((prev, cur) => cur.total > prev.total ? cur : prev, { total: -1 })
    return max.total > 0 ? max.name : 'N/A'
  }, [categories, expenses])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
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
            <h1 id="dashboard-title" className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
              Dashboard
            </h1>
            <p className="text-surface-500 mt-1">
              Overview of your financial activity
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startTour}
              className="btn bg-white dark:bg-surface-800 text-surface-600 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 flex items-center gap-2"
            >
              <FiHelpCircle /> Quick Guide
            </button>
            <Link id="add-expense-btn" to="/add" className="btn btn-primary shadow-glow flex items-center gap-2">
              <FiPlus /> Add Expense
            </Link>
          </div>
        </motion.div>

        {/* Budget Overview Bar */}
        <motion.div id="budget-overview" variants={itemVariants} className="card p-6 border-l-4 border-l-brand-500 relative overflow-hidden group will-change-transform">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <FiPieChart size={80} />
          </div>
          <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Monthly Budget</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-surface-900">₹{totalMonthlyExpenses.toLocaleString()}</span>
                <span className="text-surface-500 font-medium">of ₹{budget.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${totalMonthlyExpenses > budget ? 'text-red-500' : 'text-brand-600 dark:text-brand-400'}`}>
                {budget > 0 ? ((totalMonthlyExpenses / budget) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden relative z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budget > 0 ? (totalMonthlyExpenses / budget) * 100 : 0, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full shadow-lg ${totalMonthlyExpenses > budget
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-brand-500 to-purple-500'
                }`}
            />
          </div>
          {totalMonthlyExpenses > budget && (
            <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1 relative z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              You have exceeded your budget!
            </p>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div id="stats-section" variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toLocaleString()}`}
            icon={FiTrendingDown}
            color="red"
          />
          <StatCard
            title="This Month"
            value={`₹${monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`}
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


        {/* Recent Expenses Section (No Category Filter) */}
        <motion.div id="recent-transactions" variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-900">
              Recent Transactions
            </h2>
          </div>

          {recentExpenses.length === 0 ? (
            <EmptyState message="No expenses yet. Start tracking!" />
          ) : (
            <motion.div className="grid grid-cols-1 gap-4">
              {recentExpenses
                .slice(0, 10)
                .map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3 }}
                    className="will-change-transform"
                  >
                    <ExpenseCard
                      expense={expense}
                      onUpdate={updateExpense}
                      onDelete={deleteExpense}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div >
  )
}

export default Dashboard