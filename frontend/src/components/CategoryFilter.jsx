import { motion } from 'framer-motion'

const CategoryFilter = ({ categories, selected, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-lg font-semibold text-surface-900 mb-4">Filter by Category</h3>
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${selected === null
            ? 'bg-brand-600 text-white'
            : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
            }`}
        >
          All
        </motion.button>
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(category)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${selected === category
              ? 'bg-brand-600 text-white'
              : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
              }`}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default CategoryFilter
