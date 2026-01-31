import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
    green: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
    red: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    purple: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
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
