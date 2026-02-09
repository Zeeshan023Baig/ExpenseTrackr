import { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiEdit, FiArrowLeft } from 'react-icons/fi'
import { ExpenseContext } from '../context/ExpenseContext'
import { ExpenseForm, LoadingSpinner } from '../components'
import { expenseAPI } from '../services/api'

const EditExpense = () => {
    const { updateExpense } = useContext(ExpenseContext)
    const navigate = useNavigate()
    const { id } = useParams()
    const [expense, setExpense] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchExpense = useCallback(async () => {
        try {
            const response = await expenseAPI.getExpenseById(id)
            setExpense(response.data)
        } catch (error) {
            toast.error('Failed to fetch expense details')
            navigate('/expenses')
        } finally {
            setLoading(false)
        }
    }, [id, navigate])

    useEffect(() => {
        fetchExpense()
    }, [fetchExpense])

    const handleSubmit = async (formData) => {
        try {
            await updateExpense(id, formData)
            toast.success('Expense updated successfully! ✨')
            navigate('/expenses')
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to update expense'
            toast.error(`Error: ${message}`)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    if (!expense) return null

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
            className="layout-container py-8"
        >
            <motion.div variants={itemVariants} className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-surface-500 hover:text-brand-600 transition-colors mb-4 text-sm font-medium"
                    >
                        <FiArrowLeft className="mr-1" /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
                        Edit Expense
                    </h1>
                    <p className="text-surface-500 mt-1">
                        Update your transaction details
                    </p>
                </div>

                {/* Form Card */}
                <div className="card p-6 md:p-8">
                    <ExpenseForm
                        initialData={{
                            ...expense,
                            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        }}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(-1)}
                    />
                </div>
            </motion.div>
        </motion.div>
    )
}

export default EditExpense
