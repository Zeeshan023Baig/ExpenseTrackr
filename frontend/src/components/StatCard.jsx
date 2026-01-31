import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-100',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-100',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-100',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card ${colorClasses[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-3xl font-black mt-2">{value}</p>
        </div>
        {Icon && <Icon size={40} className="opacity-50" />}
      </div>
    </motion.div>
  )
}

export default StatCard
