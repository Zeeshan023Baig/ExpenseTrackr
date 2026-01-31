import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiPlusCircle, FiArrowLeft } from 'react-icons/fi'
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="layout-container py-8"
    >
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-surface-500 hover:text-brand-600 transition-colors mb-4 text-sm font-medium"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
            Add New Expense
          </h1>
          <p className="text-surface-500 mt-1">
            Track your spending and manage your budget
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-surface-200 shadow-sm">
          <ExpenseForm onSubmit={handleSubmit} />
        </div>

        {/* Tips Section */}
        <motion.div
          variants={itemVariants}
          className="p-5 bg-brand-50 rounded-xl border border-brand-100"
        >
          <h3 className="font-bold text-brand-800 mb-2 flex items-center gap-2">
            <FiPlusCircle /> Pro Tips
          </h3>
          <ul className="text-sm text-brand-700 space-y-2 pl-1">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-brand-400 rounded-full flex-shrink-0"></span>
              <span>Be specific with descriptions (e.g., "Lunch at Cafe" instead of "Food") for better tracking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-brand-400 rounded-full flex-shrink-0"></span>
              <span>Categorize expenses accurately to get meaningful insights in your reports.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-brand-400 rounded-full flex-shrink-0"></span>
              <span>Review your expenses regularly to stay on top of your budget.</span>
            </li>
          </ul>
        </motion.div>

      </motion.div>
    </motion.div>
  )
}

export default AddExpense
