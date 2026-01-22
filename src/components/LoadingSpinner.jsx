import { motion } from 'framer-motion'

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full"
      />
    </div>
  )
}

export default LoadingSpinner
