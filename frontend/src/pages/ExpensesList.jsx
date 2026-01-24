import { useContext, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiSearch, FiArrowDown } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseCard, CategoryFilter, EmptyState } from '../components'

const ExpensesList = () => {
  const { expenses, categories, deleteExpense } = useContext(ExpenseContext)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const filteredExpenses = useMemo(() => {
    let filtered = expenses

    if (selectedCategory) {
      filtered = filtered.filter(exp => exp.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [expenses, selectedCategory, searchTerm])

  const sortedExpenses = useMemo(() => {
    const sorted = [...filteredExpenses]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case 'highest':
        return sorted.sort((a, b) => b.amount - a.amount)
      case 'lowest':
        return sorted.sort((a, b) => a.amount - b.amount)
      default:
        return sorted
    }
  }, [filteredExpenses, sortBy])

  const handleDelete = (id) => {
    deleteExpense(id)
    toast.success('Expense deleted successfully')
  }

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)
  }, [filteredExpenses])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          All Expenses
        </h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 0.6 }}
          className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
        ></motion.div>
      </motion.div>

      {/* Search and Sort */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Search */}
        <motion.div className="relative group">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <motion.div
              animate={{ scale: 1.1 }}
              className="p-2 bg-blue-100 rounded-lg"
            >
              <FiSearch className="text-blue-600" size={18} />
            </motion.div>
            Search
          </label>
          <motion.div
            animate={{
              boxShadow: searchTerm ? '0 0 20px rgba(59, 130, 246, 0.3)' : '0 0 0px rgba(59, 130, 246, 0)'
            }}
            className="rounded-2xl overflow-hidden"
          >
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/60 backdrop-blur-sm placeholder-gray-400 transition-all duration-300 font-medium"
            />
          </motion.div>
        </motion.div>

        {/* Sort */}
        <motion.div className="relative group">
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <motion.div
              animate={{ scale: 1.1 }}
              className="p-2 bg-indigo-100 rounded-lg"
            >
              <FiArrowDown className="text-indigo-600" size={18} />
            </motion.div>
            Sort By
          </label>
          <motion.div
            animate={{
              boxShadow: '0 0 0px rgba(79, 70, 229, 0)'
            }}
            className="rounded-2xl overflow-hidden"
          >
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/60 backdrop-blur-sm transition-all duration-300 font-medium text-gray-800 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1.5rem center',
                paddingRight: '2.5rem'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={itemVariants}>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </motion.div>

      {/* Summary */}
      {filteredExpenses.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-8 shadow-xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400 rounded-full opacity-5"
          ></motion.div>

          <div className="relative z-10">
            <p className="text-lg font-bold text-blue-900 mb-2">Summary</p>
            <p className="text-4xl font-black text-blue-600 mb-2">
              ₹{totalAmount}
            </p>
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>
      )}

      {/* Expenses List */}
      {sortedExpenses.length === 0 ? (
        <EmptyState message={
          searchTerm || selectedCategory
            ? 'No expenses match your filters'
            : 'No expenses yet. Add your first expense!'
        } />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {sortedExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ExpenseCard
                expense={expense}
                onEdit={() => {}}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default ExpensesList