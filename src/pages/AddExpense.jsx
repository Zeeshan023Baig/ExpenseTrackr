import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseForm } from '../components'

const AddExpense = () => {
  const { addExpense } = useContext(ExpenseContext)
  const navigate = useNavigate()

  const handleSubmit = (formData) => {
    try {
      addExpense(formData)
      toast.success('Expense added successfully! 💰')
      navigate('/expenses')
    } catch (error) {
      toast.error('Failed to add expense')
      console.error(error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Expense</h1>
        <p className="text-gray-600">Track your spending and manage your budget</p>
      </motion.div>

      <ExpenseForm onSubmit={handleSubmit} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific with descriptions for better tracking</li>
          <li>• Categorize expenses properly for insights</li>
          <li>• Keep all receipts for verification</li>
          <li>• Review your expenses regularly</li>
        </ul>
      </motion.div>
    </motion.div>
  )
}

export default AddExpense
