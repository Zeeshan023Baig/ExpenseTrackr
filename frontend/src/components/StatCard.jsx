import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20',
    green: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
    red: 'bg-rose-600 text-white shadow-lg shadow-rose-500/20',
    purple: 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
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
