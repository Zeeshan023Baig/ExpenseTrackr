import { motion } from 'framer-motion'
import { FiTrash2, FiEdit2, FiCalendar } from 'react-icons/fi'

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="card p-5 group"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getCategoryColor(expense.category)}`}>
              {expense.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-surface-400">
              <FiCalendar size={12} />
              {formatDate(expense.createdAt)}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-surface-900 group-hover:text-brand-600 transition-colors">
              {expense.description}
            </h3>
            <p className="text-2xl font-bold text-surface-900">
              ₹{expense.amount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
          <button
            onClick={() => onEdit(expense)}
            className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
            title="Edit"
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
      </div>
    </motion.div>
  )
}

export default ExpenseCard
