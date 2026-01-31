import { useContext, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiSearch, FiArrowDown, FiTrendingUp, FiList } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseCard, CategoryFilter, EmptyState, StatCard } from '../components'

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
      className="layout-container py-8 space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
            All Expenses
          </h1>
          <p className="text-surface-500 mt-1">
            Manage and view your transaction history.
          </p>
        </div>
      </motion.div>

      {/* Summary Stats */}
      {filteredExpenses.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Value"
            value={`₹${totalAmount}`}
            icon={FiTrendingUp}
            color="brand"
          />
          <StatCard
            title="Transactions"
            value={filteredExpenses.length}
            icon={FiList}
            color="blue"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Filters Sidebar */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          {/* Search & Sort Card */}
          <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Sort By</label>
              <div className="relative">
                <FiArrowDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 input-field appearance-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
            <h3 className="font-bold text-surface-900 mb-4">Filter by Category</h3>
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </motion.div>

        {/* Expenses List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-surface-900">
              Transaction List
            </h2>
            <span className="text-sm text-surface-500">
              Showing {sortedExpenses.length} records
            </span>
          </div>

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
              className="space-y-3"
            >
              {sortedExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -10 }}
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
      </div>
    </motion.div>
  )
}

export default ExpensesList