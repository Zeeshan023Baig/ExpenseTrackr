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
            className="card p-8 bg-gradient-to-br from-indigo-900/10 via-surface-100 to-purple-900/10 dark:from-brand-950/40 dark:via-surface-100 dark:to-indigo-950/40 border-none shadow-2xl relative overflow-hidden group hover:shadow-brand-500/20 transition-all duration-500 will-change-transform gpu"
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 dark:bg-brand-500/20 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-brand-500/20 dark:group-hover:bg-brand-500/30 transition-all duration-500" />

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-500/30">
                            <FiCpu size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-surface-900 tracking-tight">AI Expense Forecast</h3>
                            <p className="text-xs font-bold text-surface-500 uppercase tracking-widest tracking-tighter">Predictive spending analysis</p>
                        </div>
                    </div>

                    {!prediction && !loading && (
                        <button
                            onClick={handlePredict}
                            disabled={isDisabled}
                            className={`btn-primary py-2.5 px-6 rounded-xl group flex items-center gap-2 relative overflow-hidden ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="relative z-10 text-sm font-bold">{isDisabled ? `Add ${5 - (expenseCount || 0)} More` : 'Analyze Patterns'}</span>
                            <FiZap className={`relative z-10 ${isDisabled ? '' : 'group-hover:animate-bounce'}`} />
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
                            className="py-12 flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                            <p className="text-sm font-bold text-surface-500 uppercase tracking-widest animate-pulse">Scanning your financial future...</p>
                        </motion.div>
                    ) : prediction ? (
                        <motion.div
                            key="prediction"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <div className="space-y-6">
                                <div className="p-6 bg-white dark:bg-surface-800/20 rounded-3xl border border-brand-500/30 relative overflow-hidden shadow-sm">
                                    <p className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-[0.2em] mb-1">Expected Spend (Next 30 Days)</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-surface-900 dark:text-white tracking-tighter">₹{prediction.predictedTotal.toLocaleString('en-IN')}</span>
                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                                            {prediction.confidence}% Conf
                                        </span>
                                    </div>
                                    <FiTrendingUp className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10" size={80} />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest pl-1">Category Predictions</p>
                                    <div className="space-y-3">
                                        {prediction.predictedCategories.slice(0, 4).map((cat, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/40 rounded-2xl border border-surface-200/50 dark:border-surface-700 hover:border-brand-500/20 transition-colors">
                                                <span className="text-xs font-bold text-surface-700 dark:text-surface-300">{cat.category}</span>
                                                <span className="text-sm font-black text-surface-900 dark:text-white">₹{cat.predictedAmount.toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between py-2">
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-widest">AI Trend Analysis</p>
                                    <div className="space-y-4">
                                        {prediction.insights.slice(0, 3).map((insight, idx) => (
                                            <div key={idx} className="flex gap-4 p-5 bg-white/50 dark:bg-surface-800/30 rounded-3xl border border-surface-200 dark:border-surface-700 shadow-sm">
                                                <FiCheckCircle className="text-brand-500 mt-1 flex-shrink-0" size={16} />
                                                <p className="text-sm font-semibold text-surface-700 dark:text-white leading-relaxed italic">
                                                    "{insight}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handlePredict}
                                    className="w-full mt-8 py-4 rounded-2xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 font-bold transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-widest shadow-sm"
                                >
                                    Update Forecast
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-8 flex items-start gap-4 border-t border-surface-200/20">
                            <FiInfo className="text-brand-500 mt-1 flex-shrink-0" size={18} />
                            <p className="text-sm text-surface-600 dark:text-surface-400 font-medium leading-relaxed">
                                Our AI calculates a conservative, trend-based forecast for the upcoming 30 days. It uses your set budget and historical patterns while damping random spending spikes.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default AIPredictor
