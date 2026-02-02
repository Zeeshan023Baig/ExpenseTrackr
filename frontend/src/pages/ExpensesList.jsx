import { useContext, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ExpenseContext } from '../context/ExpenseContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { FiDollarSign, FiTarget, FiActivity, FiEdit2, FiCheck, FiX, FiHelpCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTour } from '../hooks/useTour'

const ChartsPage = () => {
  const { expenses, budget, updateUserBudget, categories } = useContext(ExpenseContext)
  const { startTour } = useTour('analytics')
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [newBudget, setNewBudget] = useState(budget)

  // -- Derived Data --
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [expenses])

  const spendingPercentage = useMemo(() => {
    if (budget === 0) return 0
    return Math.min(Math.round((totalExpenses / budget) * 100), 100)
  }, [totalExpenses, budget])

  const weeklyLimit = useMemo(() => {
    // Basic logic: (Budget - Goal) / 4 (assuming 4 weeks in a month)
    const available = Math.max(0, budget - savingsGoal)
    return Math.floor(available / 4)
  }, [budget, savingsGoal])

  // Handler for when user changes weekly limit
  const handleWeeklyLimitChange = (newWeeklyLimit) => {
    // Calculate what the savings goal would be: Budget - (WeeklyLimit * 4)
    const calculatedSavings = Math.max(0, budget - (newWeeklyLimit * 4))
    setSavingsGoal(calculatedSavings)
  }

  // -- Charts Data --
  const categoryData = useMemo(() => {
    const data = categories.map(cat => {
      const total = expenses
        .filter(e => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0)
      return { name: cat, value: total }
    }).filter(item => item.value > 0)
    return data
  }, [expenses, categories])

  const weeklyTrendData = useMemo(() => {
    // Improve this with actual dates, for now grouping last 7 expenses as "recent"
    // Actually, let's group by week of month if we had that, or just last few transactions
    // For simplicity/mock, let's show last 7 days of spending
    // We'll create a map of date -> amount
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    return last7Days.map(dateStr => {
      const dayTotal = expenses
        .filter(e => e.createdAt && e.createdAt.startsWith(dateStr))
        .reduce((sum, e) => sum + e.amount, 0)
      return {
        date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayTotal
      }
    })
  }, [expenses])

  // -- Handlers --
  const handleSaveBudget = async () => {
    try {
      await updateUserBudget(Number(newBudget))
      setIsEditingBudget(false)
      toast.success('Budget updated successfully!')
    } catch (error) {
      toast.error('Failed to update budget')
    }
  }

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

  return (
    <div className="layout-container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="analytics-title" className="text-3xl font-bold text-surface-900 tracking-tight">Financial Analytics</h1>
          <p className="text-surface-500 mt-1">Visualize your spending and plan your savings.</p>
        </div>
        <button
          onClick={startTour}
          className="btn bg-white dark:bg-surface-800 text-surface-600 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 flex items-center gap-2"
        >
          <FiHelpCircle /> Quick Guide
        </button>
      </div>

      {/* Top Row: Budget & Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Budget Overview Card */}
        <motion.div
          id="budget-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-surface-600 mb-1">Monthly Budget</h3>
              {isEditingBudget ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-surface-900">₹</span>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="input-field w-32 py-1 px-2 text-xl font-bold"
                    autoFocus
                  />
                  <button onClick={handleSaveBudget} className="p-2 bg-brand-100 text-brand-600 rounded-lg hover:bg-brand-200"><FiCheck /></button>
                  <button onClick={() => setIsEditingBudget(false)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><FiX /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-surface-900">₹{budget.toLocaleString()}</span>
                  <button onClick={() => { setNewBudget(budget); setIsEditingBudget(true) }} className="text-surface-400 hover:text-brand-600 transition-colors">
                    <FiEdit2 size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${totalExpenses > budget ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
              <FiDollarSign size={24} />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-surface-600">Spent: ₹{totalExpenses.toLocaleString()}</span>
              <span className={`${totalExpenses > budget ? 'text-red-500' : 'text-surface-500'}`}>{spendingPercentage}% Used</span>
            </div>
            <div className="h-3 w-full bg-surface-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spendingPercentage}%` }}
                className={`h-full rounded-full ${totalExpenses > budget ? 'bg-red-500' : 'bg-brand-500'}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Savings & Prediction Calculator */}
        <motion.div
          id="savings-predictor"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 space-y-6 bg-gradient-to-br from-brand-500 to-indigo-600 text-white relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FiActivity size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Savings Predictor</h3>
                <p className="text-blue-100 text-sm">Plan your weekly spending</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-2">Target Savings Goal (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Type amount (e.g. 5000)"
                  value={savingsGoal === 0 ? '' : savingsGoal}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setSavingsGoal(value ? Number(value) : 0)
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-blue-200/50 focus:outline-none focus:bg-white/20 transition-all font-bold text-lg"
                />
                <p className="text-xs text-blue-200 mt-1">
                  Amount you want to save
                </p>
              </div>
              <div>
                <label className="block text-blue-100 text-sm font-medium mb-2">Max Weekly Spend (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Type amount (e.g. 2000)"
                  value={weeklyLimit === 0 ? '' : weeklyLimit}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    handleWeeklyLimitChange(value ? Number(value) : 0)
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-blue-200/50 focus:outline-none focus:bg-white/20 transition-all font-bold text-lg"
                />
                <p className="text-xs text-blue-200 mt-1">
                  Your weekly spending limit
                </p>
              </div>
            </div>
          </div>

          {/* Decorative BG */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-32 blur-3xl" />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Category Pie Chart */}
        <motion.div
          id="category-chart"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
            <FiTarget className="text-brand-500" /> Spending by Category
          </h3>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-surface-400">
                No category data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Weekly Trend Bar Chart */}
        <motion.div
          id="weekly-trend"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
            <FiActivity className="text-brand-500" /> Last 7 Days Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <RechartsTooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

export default ChartsPage