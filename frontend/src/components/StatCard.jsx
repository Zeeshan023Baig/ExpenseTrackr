import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color = 'brand' }) => {
  const styles = {
    brand: { bg: 'bg-indigo-500/10', text: 'text-indigo-400' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    red: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
    purple: { bg: 'bg-violet-500/10', text: 'text-violet-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' }
  }

  const activeStyle = styles[color] || styles.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
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
