import { motion } from 'framer-motion'
import { FiAlertCircle } from 'react-icons/fi'

const EmptyState = ({ message = 'No expenses found', icon: Icon = FiAlertCircle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card text-center py-12"
    >
      <Icon size={48} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg">{message}</p>
    </motion.div>
  )
}

export default EmptyState
