import { motion } from 'framer-motion'
import { FiTrash2, FiEdit2 } from 'react-icons/fi'
import { useContext } from 'react'
import { ExpenseContext } from '../context/ExpenseContext'

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const getCategoryColor = (category) => {
    const colors = {
      Food: 'bg-orange-100 text-orange-800',
      Transportation: 'bg-blue-100 text-blue-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Utilities: 'bg-yellow-100 text-yellow-800',
      Healthcare: 'bg-red-100 text-red-800',
      Shopping: 'bg-pink-100 text-pink-800',
      Other: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card flex justify-between items-start"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{expense.description}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded ${getCategoryColor(expense.category)}`}>
            {expense.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{formatDate(expense.createdAt)}</p>
        <p className="text-2xl font-bold text-blue-600">₹{expense.amount.toFixed(2)}</p>
      </div>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(expense)}
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit"
        >
          <FiEdit2 size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(expense.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <FiTrash2 size={20} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ExpenseCard
