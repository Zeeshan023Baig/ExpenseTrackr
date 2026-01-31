import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-100',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-100',
    red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-100',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-100'
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
