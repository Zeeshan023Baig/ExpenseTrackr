import { motion } from 'framer-motion'
import { FiTrash2, FiEdit2, FiCalendar } from 'react-icons/fi'

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const getCategoryColor = (category) => {
    const colors = {
      Food: 'bg-orange-50 text-orange-700 border-orange-100',
      Transportation: 'bg-blue-50 text-blue-700 border-blue-100',
      Entertainment: 'bg-purple-50 text-purple-700 border-purple-100',
      Utilities: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      Healthcare: 'bg-red-50 text-red-700 border-red-100',
      Shopping: 'bg-pink-50 text-pink-700 border-pink-100',
      Other: 'bg-surface-100 text-surface-700 border-surface-200'
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
      className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm hover:shadow-md transition-all group"
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
