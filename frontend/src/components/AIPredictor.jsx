import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiTrendingUp, FiInfo, FiZap, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const AIPredictor = ({ expenseCount }) => {
    const [loading, setLoading] = useState(false)
    const [prediction, setPrediction] = useState(null)

    const isDisabled = (expenseCount || 0) < 5

    const handlePredict = async () => {
        if (isDisabled) {
            toast.error('Please add at least 5 expenses to use AI Prediction')
            return
        }
        setLoading(true)
        try {
            const { data } = await aiAPI.predict()
            setPrediction(data)
            toast.success('AI Forecast Refreshed!')
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to generate prediction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 bg-white/60 dark:bg-surface-800/40 backdrop-blur-2xl border border-white/40 dark:border-surface-700/50 shadow-2xl relative overflow-hidden group transition-all duration-700 rounded-[2.5rem]"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/5 dark:bg-brand-500/5 rounded-full blur-[140px]" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 flex flex-col gap-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-brand-600 dark:bg-brand-500 text-white rounded-2xl shadow-xl shadow-brand-500/20">
                            <FiCpu size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">AI Expense Forecast</h3>
                            <p className="text-[10px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest mt-1">Predictive Intelligence Engine</p>
                        </div>
                    </div>

                    {!prediction && !loading && (
                        <button
                            onClick={handlePredict}
                            disabled={isDisabled}
                            className={`btn-primary py-3 px-6 rounded-2xl group flex items-center gap-2.5 shadow-xl shadow-brand-500/20 active:scale-95 transition-all duration-300 ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="text-sm font-semibold tracking-wide">{isDisabled ? `Add ${5 - (expenseCount || 0)} More` : 'Analyze Patterns'}</span>
                            <FiZap className={`w-4 h-4 ${isDisabled ? '' : 'group-hover:rotate-12 transition-transform'}`} />
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-16 flex flex-col items-center gap-8"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 border-2 border-brand-100 dark:border-brand-900/30 border-t-brand-600 dark:border-t-brand-500 rounded-full animate-spin" />
                                <div className="absolute inset-1.5 w-13 h-13 border-2 border-indigo-100 dark:border-indigo-900/20 border-t-indigo-500 dark:border-t-indigo-500 rounded-full animate-spin [animation-duration:1s] opacity-60" />
                            </div>
                            <p className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest animate-pulse">Computing Spending DNA...</p>
                        </motion.div>
                    ) : prediction ? (
                        <motion.div
                            key="prediction"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                        >
                            <div className="space-y-8">
                                <section>
                                    <p className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-4">Projected Monthly Volume</p>
                                    <div className="p-8 bg-surface-50/50 dark:bg-surface-900/30 rounded-3xl border border-surface-200/50 dark:border-white/5 relative overflow-hidden group/card shadow-sm">
                                        <div className="flex items-baseline gap-3 relative z-10">
                                            <span className="text-5xl font-bold text-surface-900 dark:text-white tracking-tighter">₹{prediction.predictedTotal.toLocaleString('en-IN')}</span>
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                {prediction.confidence}% Confidence
                                            </span>
                                        </div>
                                        <FiTrendingUp className="absolute -right-4 -bottom-4 text-brand-500/5 dark:text-brand-500/10 transition-transform duration-1000 group-hover/card:scale-110" size={160} />
                                    </div>
                                </section>

                                <section className="space-y-5">
                                    <div className="flex items-center justify-between px-1">
                                        <p className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Category Hotspots</p>
                                        <span className="text-[10px] font-medium text-surface-400 dark:text-surface-500 opacity-60">Top 4</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {prediction.predictedCategories.slice(0, 4).map((cat, idx) => (
                                            <div key={idx} className="p-5 bg-white/50 dark:bg-surface-900/20 rounded-2xl border border-surface-200/50 dark:border-white/5 hover:border-brand-500/30 transition-all group/item shadow-sm">
                                                <span className="block text-[11px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5 group-hover/item:text-brand-500 transition-colors truncate">
                                                    {cat.category}
                                                </span>
                                                <span className="text-xl font-bold text-surface-900 dark:text-white">₹{cat.predictedAmount.toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="flex flex-col justify-between">
                                <section className="space-y-6">
                                    <p className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Trend analysis</p>
                                    <div className="space-y-3">
                                        {prediction.insights.slice(0, 3).map((insight, idx) => (
                                            <div key={idx} className="flex gap-4 p-5 rounded-3xl bg-surface-50/50 dark:bg-surface-900/20 border border-transparent hover:border-surface-200 dark:hover:border-white/5 transition-all group/insight">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] flex-shrink-0" />
                                                <p className="text-sm font-medium text-surface-700 dark:text-surface-300 leading-relaxed">
                                                    {insight}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="mt-8 pt-8 border-t border-surface-200 dark:border-surface-700/50">
                                    <button
                                        onClick={handlePredict}
                                        className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 group shadow-xl shadow-brand-500/20"
                                    >
                                        <span className="text-sm font-bold tracking-wider">REFRESH FORECAST MODEL</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-start gap-4 p-6 bg-brand-500/5 rounded-3xl border border-brand-500/10">
                            <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-600 dark:text-brand-400">
                                <FiInfo size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-surface-900 dark:text-white tracking-wide">AI Forecast Ready</h4>
                                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed font-medium">
                                    Our predictive engine analyzes your historical data to forecast monthly spending with personalized category insights.
                                </p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default AIPredictor
