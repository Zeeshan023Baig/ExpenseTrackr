import { useContext, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiCalendar, FiFilter, FiArrowUp, FiArrowDown, FiLayers, FiList } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseCard, EmptyState } from '../components'

const Expenses = () => {
    const { expenses, categories, deleteExpense, updateExpense } = useContext(ExpenseContext)

    // State for filters and sorting
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [sortField, setSortField] = useState('date') // 'date', 'amount'
    const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'

    // Filtering and Sorting Logic
    const filteredAndSortedExpenses = useMemo(() => {
        return expenses
            .filter(expense => {
                const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter

                const expDate = new Date(expense.date || expense.createdAt)
                const start = startDate ? new Date(startDate) : null
                const end = endDate ? new Date(endDate) : null

                if (end) end.setHours(23, 59, 59, 999)

                const matchesDate = (!start || expDate >= start) && (!end || expDate <= end)

                return matchesSearch && matchesCategory && matchesDate
            })
            .sort((a, b) => {
                let comparison = 0
                if (sortField === 'date') {
                    comparison = new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
                } else if (sortField === 'amount') {
                    comparison = b.amount - a.amount
                }

                return sortOrder === 'desc' ? comparison : -comparison
            })
    }, [expenses, searchTerm, categoryFilter, startDate, endDate, sortField, sortOrder])

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="layout-container py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Expenses</h1>
                    <p className="text-surface-500 mt-1">Manage and track your full transaction history.</p>
                </div>
                <div className="bg-brand-50 dark:bg-brand-900/10 px-4 py-2 rounded-2xl border border-brand-500/20">
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                        {filteredAndSortedExpenses.length} Records Found
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sticky top-20 z-40 bg-surface-50/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-surface-200 dark:border-surface-800">
                <div className="relative col-span-1 lg:col-span-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-600 dark:text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 h-11"
                    />
                </div>

                <div className="flex gap-2 col-span-1 lg:col-span-2">
                    <div className="relative flex-1">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-600 dark:text-surface-400 z-10" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input pl-10 h-11 text-sm bg-white dark:bg-surface-800"
                            placeholder="Start Date"
                        />
                    </div>
                    <div className="relative flex-1">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-600 dark:text-surface-400 z-10" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input pl-10 h-11 text-sm bg-white dark:bg-surface-800"
                            placeholder="End Date"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-600 dark:text-surface-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="input pl-10 h-11 appearance-none bg-white dark:bg-surface-800"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-1">
                        <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                            className="bg-transparent text-sm font-bold text-surface-600 px-2 outline-none cursor-pointer"
                        >
                            <option value="date">Date</option>
                            <option value="amount">Amount</option>
                        </select>
                        <button
                            onClick={toggleSortOrder}
                            className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg text-brand-600 transition-colors"
                            title={sortOrder === 'asc' ? 'Sorting Ascending' : 'Sorting Descending'}
                        >
                            {sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            {filteredAndSortedExpenses.length === 0 ? (
                <EmptyState message={searchTerm || categoryFilter !== 'All' || startDate || endDate ? "No matches found for your current filters." : "No expenses yet."} />
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-4"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredAndSortedExpenses.map(expense => (
                            <motion.div
                                key={expense.id}
                                variants={itemVariants}
                                layout
                            >
                                <ExpenseCard
                                    expense={expense}
                                    onUpdate={updateExpense}
                                    onDelete={deleteExpense}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}

export default Expenses
