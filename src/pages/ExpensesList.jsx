import { useContext, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseCard, CategoryFilter, EmptyState, LoadingSpinner } from '../components'

const ExpensesList = () => {
  const { expenses, categories, deleteExpense, updateExpense } = useContext(ExpenseContext)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [editingId, setEditingId] = useState(null)

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

  const handleEdit = (expense) => {
    setEditingId(expense.id)
  }

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)
  }, [filteredExpenses])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Search and Sort */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Expenses
          </label>
          <input
            type="text"
            placeholder="Search by description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>
      </motion.div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Summary */}
      {filteredExpenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-blue-50"
        >
          <p className="text-lg font-semibold text-blue-900">
            Total: <span className="text-2xl text-blue-600">₹{totalAmount}</span>
            {' '}({filteredExpenses.length} expenses)
          </p>
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
          className="space-y-3"
        >
          {sortedExpenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default ExpensesList
