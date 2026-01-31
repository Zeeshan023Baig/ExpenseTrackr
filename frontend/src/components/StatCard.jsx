import { motion } from 'framer-motion'

<<<<<<< HEAD
const StatCard = ({ title, value, icon: Icon, color = 'brand' }) => {
  const styles = {
    brand: { bg: 'bg-brand-50', text: 'text-brand-600' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    red: { bg: 'bg-rose-50', text: 'text-rose-600' },
    purple: { bg: 'bg-violet-50', text: 'text-violet-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' }
=======
const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20',
    green: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
    red: 'bg-rose-600 text-white shadow-lg shadow-rose-500/20',
    purple: 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
>>>>>>> eb1ab328adf6e2b6f6b094e43cf207515300648c
  }

  const activeStyle = styles[color] || styles.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-surface-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${activeStyle.bg} ${activeStyle.text}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard
