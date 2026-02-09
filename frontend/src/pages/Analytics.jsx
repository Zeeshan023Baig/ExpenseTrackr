import { useContext, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExpenseContext } from '../context/ExpenseContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import { FiDollarSign, FiTarget, FiActivity, FiEdit2, FiCheck, FiX, FiHelpCircle, FiCalendar, FiBarChart2, FiList } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useTour } from '../hooks/useTour'
import ExpenseCard from '../components/ExpenseCard'

const Analytics = () => {
  const { expenses, budget, updateUserBudget, categories, updateExpense, deleteExpense } = useContext(ExpenseContext)
  const { startTour } = useTour('analytics')
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [newBudget, setNewBudget] = useState(budget)
  const [trendEndDate, setTrendEndDate] = useState(new Date().toISOString().split('T')[0])

  // -- Derived Data --
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [expenses])

  const spendingPercentage = useMemo(() => {
    if (budget === 0) return 0
    return Math.min(Math.round((totalExpenses / budget) * 100), 100)
  }, [totalExpenses, budget])

  const weeklyLimit = useMemo(() => {
    const available = Math.max(0, budget - savingsGoal)
    return Math.floor(available / 4)
  }, [budget, savingsGoal])

  // Handler for when user changes weekly limit
  const handleWeeklyLimitChange = (newWeeklyLimit) => {
    const calculatedSavings = Math.max(0, budget - (newWeeklyLimit * 4))
    setSavingsGoal(calculatedSavings)
  }

  // -- Charts Data --
  const categoryData = useMemo(() => {
    // Single pass to group expenses by category
    const totals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    return categories
      .map(cat => ({ name: cat, value: totals[cat] || 0 }))
      .filter(item => item.value > 0)
  }, [expenses, categories])

  const weeklyTrendData = useMemo(() => {
    const endDate = new Date(trendEndDate)
    // Create an object for $O(1)$ lookup
    const dailyMap = expenses.reduce((acc, exp) => {
      const eDate = (exp.date || exp.createdAt).split('T')[0]
      acc[eDate] = (acc[eDate] || 0) + exp.amount
      return acc
    }, {})

    return [...Array(7)].map((_, i) => {
      const d = new Date(endDate)
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        fullDate: dateStr,
        amount: dailyMap[dateStr] || 0
      }
    })
  }, [expenses, trendEndDate])

  const monthlySpendingData = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Single pass to group expenses by month
    const monthlyTotals = expenses.reduce((acc, exp) => {
      const date = new Date(exp.date || exp.createdAt)
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth()
        acc[monthIndex] = (acc[monthIndex] || 0) + exp.amount
      }
      return acc
    }, {})

    return months.map((month, index) => ({
      month,
      amount: monthlyTotals[index] || 0
    }))
  }, [expenses])

  const selectedDayExpenses = useMemo(() => {
    return expenses.filter(e => {
      const eDate = (e.date || e.createdAt).split('T')[0]
      return eDate === trendEndDate
    }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
  }, [expenses, trendEndDate])

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-surface-800 p-3 rounded-xl border border-surface-200 dark:border-surface-700 shadow-xl">
          <p className="text-xs font-bold text-surface-400 mb-1 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-black text-surface-900">₹{payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="layout-container py-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-100 dark:border-surface-800 pb-8">
        <div>
          <h1 id="analytics-title" className="text-4xl font-black text-surface-900 tracking-tight">Financial <span className="text-brand-600">Analytics</span></h1>
          <p className="text-surface-500 mt-2 text-lg">Powerful insights into your spending habits.</p>
        </div>
        <button
          onClick={startTour}
          className="btn bg-brand-50 hover:bg-brand-100 text-brand-600 border-none flex items-center gap-2 font-bold py-3 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          <FiHelpCircle size={20} /> Guide
        </button>
      </div>

      {/* Top Row: Budget & Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          id="budget-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 border-none bg-surface-50/50 dark:bg-surface-900/50 backdrop-blur-xl ring-1 ring-surface-200/50 dark:ring-surface-800/50"
        >
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest">Monthly Budget</h3>
              {isEditingBudget ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-surface-900">₹</span>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="bg-transparent border-b-2 border-brand-500 w-32 py-1 px-2 text-3xl font-black text-surface-900 outline-none"
                    autoFocus
                  />
                  <div className="flex gap-1 ml-2">
                    <button onClick={handleSaveBudget} className="p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all"><FiCheck /></button>
                    <button onClick={() => setIsEditingBudget(false)} className="p-2 bg-surface-200 dark:bg-surface-700 text-surface-600 rounded-xl hover:bg-surface-300 dark:hover:bg-surface-600 transition-all"><FiX /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <span className="text-5xl font-black text-surface-900 tracking-tighter">₹{budget.toLocaleString()}</span>
                  <button onClick={() => { setNewBudget(budget); setIsEditingBudget(true) }} className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-brand-50 rounded-lg text-brand-600">
                    <FiEdit2 size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className={`p-4 rounded-2xl ${totalExpenses > budget ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
              <FiDollarSign size={28} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm font-bold text-surface-400 uppercase tracking-wider block mb-1">Total Spent</span>
                <span className="text-2xl font-bold text-surface-900">₹{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className={`text-lg font-black ${totalExpenses > budget ? 'text-red-500' : 'text-brand-600'}`}>
                  {spendingPercentage}%
                </span>
                <span className="text-xs font-bold text-surface-400 block uppercase">Utilization</span>
              </div>
            </div>
            <div className="h-4 w-full bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spendingPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full shadow-lg ${totalExpenses > budget ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-brand-500 to-indigo-600'}`}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          id="savings-predictor"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 border-none bg-gradient-to-br from-brand-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl shadow-brand-500/20"
        >
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <FiActivity size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Savings Predictor</h3>
                <p className="text-brand-100/80 font-medium">Smart planning for your future.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <label className="block text-brand-100 text-xs font-black uppercase tracking-widest">Target Savings (₹)</label>
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={savingsGoal === 0 ? '' : savingsGoal}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setSavingsGoal(value ? Number(value) : 0)
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 focus:border-white/40 focus:bg-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/30 outline-none transition-all font-black text-2xl"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-brand-100 text-xs font-black uppercase tracking-widest">Weekly Budget (₹)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={weeklyLimit === 0 ? '' : weeklyLimit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      handleWeeklyLimitChange(value ? Number(value) : 0)
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 focus:border-white/40 focus:bg-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/30 outline-none transition-all font-black text-2xl"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-400/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          id="category-chart"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-8 border-none bg-white dark:bg-surface-900 shadow-xl shadow-surface-200/50 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-surface-900 flex items-center gap-3">
              <span className="p-2 bg-brand-50 text-brand-600 rounded-xl"><FiTarget /></span>
              Category Breakdown
            </h3>
          </div>
          <div className="h-[350px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-sm font-bold text-surface-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-surface-400 gap-4">
                <FiBarChart2 size={48} className="opacity-20" />
                <p className="font-bold">No category data available yet</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          id="weekly-trend"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-8 border-none bg-white dark:bg-surface-900 shadow-xl shadow-surface-200/50 dark:shadow-none"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-black text-surface-900 flex items-center gap-3">
              <span className="p-2 bg-brand-50 text-brand-600 rounded-xl"><FiActivity /></span>
              Weekly Trend
            </h3>
            <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800 px-4 py-2 rounded-2xl border border-surface-100 dark:border-surface-700">
              <FiCalendar className="text-surface-400" />
              <input
                type="date"
                value={trendEndDate}
                onChange={(e) => setTrendEndDate(e.target.value)}
                className="bg-transparent text-sm font-black text-surface-700 dark:text-surface-300 outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <RechartsTooltip cursor={{ fill: '#f8fafc', radius: 10 }} content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  fill="#6366f1"
                  radius={[8, 8, 8, 8]}
                  barSize={32}
                >
                  {weeklyTrendData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.amount > (weeklyLimit / 7) ? '#f43f5e' : '#6366f1'}
                      opacity={entry.fullDate === trendEndDate ? 1 : 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Selected Day Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-4">
          <h3 className="text-2xl font-black text-surface-900 flex items-center gap-3">
            <span className="p-2 bg-brand-50 text-brand-600 rounded-xl"><FiList /></span>
            Daily Timeline
            <span className="text-surface-400 text-lg font-bold ml-2">
              {new Date(trendEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </h3>
          <span className="px-4 py-2 bg-brand-50 text-brand-600 rounded-2xl text-sm font-black ring-1 ring-brand-100">
            {selectedDayExpenses.length} Records found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {selectedDayExpenses.length > 0 ? (
              selectedDayExpenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onUpdate={updateExpense}
                  onDelete={deleteExpense}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center card bg-surface-50/50 border-dashed border-2 border-surface-200 dark:border-surface-700 flex flex-col items-center gap-4"
              >
                <div className="p-4 bg-white dark:bg-surface-800 rounded-full shadow-lg text-surface-300">
                  <FiCalendar size={64} />
                </div>
                <div>
                  <p className="font-black text-2xl text-surface-900">Quiet day!</p>
                  <p className="text-surface-500 font-medium">No transactions found for this date.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Full Width Monthly Trend */}
      <motion.div
        id="monthly-trend"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-8 border-none bg-white dark:bg-surface-900 shadow-xl"
      >
        <h3 className="text-xl font-black text-surface-900 mb-8 flex items-center gap-3">
          <span className="p-2 bg-brand-50 text-brand-600 rounded-xl"><FiBarChart2 /></span>
          Annual Performance Curve ({new Date().getFullYear()})
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlySpendingData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorAmount)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

export default Analytics