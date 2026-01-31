import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiInfo } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseForm } from '../components'

const AddExpense = () => {
  const { addExpense } = useContext(ExpenseContext)
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    try {
      await addExpense(formData)
      toast.success('Expense added successfully! 💰')
      navigate('/expenses')
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add expense'
      toast.error(`Error: ${message}`)
      console.error(error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto pt-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Add New Expense
        </h1>
        <p className="text-gray-600 font-medium">Track your spending and manage your budget</p>
      </motion.div>

      <ExpenseForm onSubmit={handleSubmit} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-white/50 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3 text-blue-700">
          <FiInfo className="w-5 h-5" />
          <h3 className="font-bold">Pro Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            Be specific with descriptions (e.g. "Lunch at Sarah's" vs "Food")
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            Categorize accurately to get meaningful insights
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-1">•</span>
            Keep receipts for verification if needed
          </li>
        </ul>
      </motion.div>
    </motion.div>
  )
}

export default AddExpense
