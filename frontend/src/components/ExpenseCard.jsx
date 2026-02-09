import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrash2, FiEdit2, FiCalendar, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ExpenseCard = ({ expense, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempAmount, setTempAmount] = useState(expense.amount)
  const [tempDescription, setTempDescription] = useState(expense.description)
  const [tempDate, setTempDate] = useState(new Date(expense.date || expense.createdAt).toISOString().split('T')[0])
  const [isUpdating, setIsUpdating] = useState(false)

  const getCategoryColor = (category) => {
    const colors = {
      Food: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
      Transportation: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      Entertainment: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      Utilities: 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
      Healthcare: 'bg-rose-50 text-red-700 border-red-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
      Shopping: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20',
      Other: 'bg-surface-100 text-surface-700 border-surface-200 dark:bg-surface-500/10 dark:text-surface-400 dark:border-surface-500/20'
    }
    return colors[category] || colors.Other
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSave = async () => {
    const hasAmountChanged = Number(tempAmount) !== Number(expense.amount)
    const hasDescriptionChanged = tempDescription.trim() !== expense.description.trim()
    const originalDate = new Date(expense.date || expense.createdAt).toISOString().split('T')[0]
    const hasDateChanged = tempDate !== originalDate

    if (!hasAmountChanged && !hasDescriptionChanged && !hasDateChanged) {
      setIsEditing(false)
      return
    }

    if (isNaN(tempAmount) || tempAmount < 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!tempDescription.trim()) {
      toast.error('Description is required')
      return
    }

    setIsUpdating(true)
    try {
      await onUpdate(expense.id, {
        amount: Number(tempAmount),
        description: tempDescription.trim(),
        date: tempDate
      })
      setIsEditing(false)
      toast.success('Updated successfully!')
    } catch (error) {
      toast.error('Failed to update')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setTempAmount(expense.amount)
    setTempDescription(expense.description)
    setTempDate(new Date(expense.date || expense.createdAt).toISOString().split('T')[0])
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="card p-5 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryColor(expense.category)}`}>
              {expense.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-surface-400">
              <FiCalendar size={12} />
              {formatDate(expense.createdAt || expense.date)}
            </span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing-fields"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-3"
                >
                  <div>
                    <input
                      type="text"
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      placeholder="Description"
                      className="w-full bg-surface-50 border border-brand-200 rounded-lg px-3 py-1.5 text-lg font-semibold text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      autoFocus
                      disabled={isUpdating}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-surface-900">₹</span>
                      <input
                        type="number"
                        value={tempAmount}
                        onChange={(e) => setTempAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-32 bg-surface-50 border border-brand-200 rounded-lg px-2 py-1 text-xl font-bold text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-surface-50 border border-brand-200 rounded-lg px-3 py-1.5">
                      <FiCalendar size={16} className="text-brand-500" />
                      <input
                        type="date"
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-surface-900 focus:outline-none cursor-pointer"
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="display-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="font-semibold text-lg text-surface-900 group-hover:text-brand-600 transition-colors">
                    {expense.description}
                  </h3>
                  <p className="text-2xl font-bold text-surface-900 mt-1">
                    ₹{expense.amount.toLocaleString()}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                title="Save Changes"
              >
                <FiCheck size={20} />
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Cancel"
              >
                <FiX size={20} />
              </button>
            </div>
          ) : (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                title="Edit Details"
              >
                <FiEdit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  )
}

export default ExpenseCard
