import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-200',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-200',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {Icon && <Icon size={40} className="opacity-20" />}
      </div>
    </motion.div>
  )
}

export default StatCard
