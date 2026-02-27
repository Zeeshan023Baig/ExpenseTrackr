import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const Calendar = ({ selectedDate, onDateSelect, transactions = [] }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate))

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear()
        const month = viewDate.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const totalDays = new Date(year, month + 1, 0).getDate()

        const days = []
        // Add empty slots for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null)
        }
        // Add actual days
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(year, month, i))
        }
        return days
    }, [viewDate])

    const monthName = viewDate.toLocaleString('default', { month: 'long' })
    const year = viewDate.getFullYear()

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const isToday = (date) => {
        if (!date) return false
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    const isSelected = (date) => {
        if (!date) return false
        return date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
    }

    const hasTransactions = (date) => {
        if (!date) return false
        const dateString = date.toISOString().split('T')[0]
        return transactions.some(t => t.date && t.date.startsWith(dateString)) ||
            transactions.some(t => t.createdAt && t.createdAt.startsWith(dateString))
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="card p-6 select-none">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-surface-900 uppercase tracking-wider">
                    Your Transactions
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-surface-100 rounded-full transition-colors"
                    >
                        <FiChevronLeft className="text-surface-600" size={20} />
                    </button>

                    <div className="flex items-center gap-2 bg-surface-50 p-1 rounded-xl border border-surface-200">
                        <span className="px-3 py-1 font-bold text-surface-900">{monthName}</span>
                        <span className="px-3 py-1 font-bold text-surface-900">{year}</span>
                    </div>

                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-surface-100 rounded-full transition-colors"
                    >
                        <FiChevronRight className="text-surface-600" size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-surface-400 py-2 border-b border-surface-100">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, index) => (
                    <div key={index} className="aspect-square flex items-center justify-center">
                        {date ? (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onDateSelect(date)}
                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all relative
                  ${isSelected(date)
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                                        : isToday(date)
                                            ? 'bg-brand-50 text-brand-700 border border-brand-200'
                                            : 'text-surface-700 hover:bg-surface-50'
                                    }
                `}
                            >
                                {date.getDate()}
                                {hasTransactions(date) && !isSelected(date) && (
                                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-500 rounded-full" />
                                )}
                            </motion.button>
                        ) : (
                            <div className="w-10 h-10" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Calendar
