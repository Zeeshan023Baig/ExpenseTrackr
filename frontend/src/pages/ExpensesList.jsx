import { useContext, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus, FiFilter, FiList } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseCard, EmptyState, Calendar, LoadingSpinner } from '../components'

const ExpensesList = () => {
  const { expenses, deleteExpense, loading } = useContext(ExpenseContext)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'all'
  const navigate = useNavigate()

  const filteredExpenses = useMemo(() => {
    if (viewMode === 'all') {
      return [...expenses].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    }

    const dateStr = selectedDate.toISOString().split('T')[0]
    return expenses.filter(e => {
      const eDate = (e.date || e.createdAt).split('T')[0]
      return eDate === dateStr
    })
  }, [expenses, selectedDate, viewMode])

  const totalForDay = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  }, [filteredExpenses])

  if (loading && expenses.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="layout-container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-surface-500 mt-1">
            Browse and manage your daily spending
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-surface-100 p-1 rounded-xl border border-surface-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-white text-brand-600 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                }`}
            >
              <FiFilter size={16} /> Calendar
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'all' ? 'bg-white text-brand-600 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                }`}
            >
              <FiList size={16} /> All
            </button>
          </div>
          <Link to="/add" className="btn btn-primary flex items-center gap-2">
            <FiPlus /> Add New
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Calendar (only in calendar mode) */}
        {viewMode === 'calendar' && (
          <div className="lg:col-span-5">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              transactions={expenses}
            />
          </div>
        )}

        {/* Right Column: Transactions List */}
        <div className={viewMode === 'calendar' ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                {viewMode === 'calendar' ? (
                  <>
                    Events - ({selectedDate.toLocaleDateString('en-GB')})
                    {filteredExpenses.length > 0 && (
                      <span className="text-sm font-normal text-surface-400 ml-2">
                        Total spent: ₹{totalForDay.toFixed(2)}
                      </span>
                    )}
                  </>
                ) : (
                  'All Recorded Transactions'
                )}
              </h3>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredExpenses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <EmptyState
                    message={viewMode === 'calendar'
                      ? "There is no event on this date."
                      : "No transactions found."
                    }
                  />
                </motion.div>
              ) : (
                <motion.div className="space-y-3">
                  {filteredExpenses.map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <ExpenseCard
                        expense={expense}
                        onEdit={(exp) => navigate(`/edit/${exp.id}`)}
                        onDelete={deleteExpense}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpensesList