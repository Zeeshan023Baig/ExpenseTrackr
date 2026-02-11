import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon: Icon, color = 'brand' }) => {
  const styles = {
    brand: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
    red: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
    purple: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' }
  }

  const activeStyle = styles[color] || styles.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-6 will-change-transform"
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
