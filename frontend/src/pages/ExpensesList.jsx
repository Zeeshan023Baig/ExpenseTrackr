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
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Search
          </label>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            Sort By
          </label>
          <div className="relative">
            <FiArrowDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field pl-11 appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
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
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-xl shadow-blue-500/20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full opacity-10 blur-3xl"
          ></motion.div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-blue-100 font-bold mb-1 uppercase tracking-wider text-sm">Total Summary</p>
              <p className="text-5xl font-black text-white">
                ₹{totalAmount}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
              <p className="text-sm font-bold text-white">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
              </p>
            </div>
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
                onEdit={() => { }}
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