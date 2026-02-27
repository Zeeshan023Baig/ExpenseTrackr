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
            className="card p-8 bg-white/40 dark:bg-surface-800/20 backdrop-blur-xl border border-white/20 dark:border-surface-700/30 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-2xl relative overflow-hidden group transition-all duration-700 rounded-[2.5rem]"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="relative z-10 flex flex-col gap-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-brand-600 dark:bg-brand-500 text-white rounded-[1.25rem] shadow-[0_12px_24px_-8px_rgba(37,99,235,0.4)]">
                            <FiCpu size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight">AI Expense Forecast</h3>
                            <p className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.3em] opacity-80 mt-1 pl-0.5">Predictive Intelligence Engine</p>
                        </div>
                    </div>

                    {!prediction && !loading && (
                        <button
                            onClick={handlePredict}
                            disabled={isDisabled}
                            className={`btn-primary py-3.5 px-8 rounded-2xl group flex items-center gap-3 relative overflow-hidden shadow-xl shadow-brand-500/20 active:scale-95 transition-all duration-300 ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="relative z-10 text-sm font-bold tracking-wide">{isDisabled ? `Add ${5 - (expenseCount || 0)} More` : 'Analyze Patterns'}</span>
                            <FiZap className={`relative z-10 ${isDisabled ? '' : 'group-hover:rotate-12 transition-transform'}`} size={18} />
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
                                <div className="w-20 h-20 border-[3px] border-brand-100 dark:border-brand-900/30 border-t-brand-600 dark:border-t-brand-500 rounded-full animate-spin" />
                                <div className="absolute inset-2 w-16 h-16 border-[3px] border-purple-100 dark:border-indigo-900/20 border-t-purple-500 dark:border-t-indigo-500 rounded-full animate-spin [animation-duration:1s] opacity-60" />
                            </div>
                            <p className="text-xs font-black text-surface-500 dark:text-surface-400 uppercase tracking-[0.4em] animate-pulse">Computing Spending DNA...</p>
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
                                    <p className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-[0.3em] mb-4 pl-1">Projected Monthly Volume</p>
                                    <div className="p-8 bg-gradient-to-br from-white/60 to-surface-50/40 dark:from-white/5 dark:to-transparent rounded-[2rem] border border-white/40 dark:border-white/5 relative overflow-hidden shadow-sm group/card">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-5xl font-black text-surface-900 dark:text-white tracking-tighter">₹{prediction.predictedTotal.toLocaleString('en-IN')}</span>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                                                    {prediction.confidence}% Confidence
                                                </span>
                                            </div>
                                        </div>
                                        <FiTrendingUp className="absolute top-0 right-0 p-6 text-brand-500 opacity-[0.03] dark:opacity-[0.05] group-hover/card:scale-110 transition-transform duration-700" size={140} />
                                    </div>
                                </section>

                                <section className="space-y-5">
                                    <div className="flex items-center justify-between px-1">
                                        <p className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-[0.3em]">Category Hotspots</p>
                                        <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500">Top 4</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {prediction.predictedCategories.slice(0, 4).map((cat, idx) => (
                                            <div key={idx} className="p-5 bg-white/30 dark:bg-surface-800/20 backdrop-blur-md rounded-2xl border border-white/40 dark:border-white/5 hover:border-brand-500/30 transition-all group/item">
                                                <span className="block text-[10px] font-black text-surface-500 dark:text-surface-400 uppercase tracking-widest mb-1 group-hover/item:text-brand-500 transition-colors">{cat.category}</span>
                                                <span className="text-lg font-black text-surface-900 dark:text-white">₹{cat.predictedAmount.toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="flex flex-col justify-between pt-1">
                                <div className="space-y-8">
                                    <p className="text-[10px] font-black text-surface-400 dark:text-surface-500 uppercase tracking-[0.3em] pl-1">Strategic trend analysis</p>
                                    <div className="space-y-2">
                                        {prediction.insights.slice(0, 3).map((insight, idx) => (
                                            <div key={idx} className="flex gap-5 p-6 rounded-3xl hover:bg-white/40 dark:hover:bg-white/5 transition-all group/insight border-l-4 border-transparent hover:border-brand-500">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] flex-shrink-0 group-hover/insight:scale-125 transition-transform" />
                                                <p className="text-sm font-semibold text-surface-700 dark:text-surface-200 leading-relaxed tracking-wide italic">
                                                    "{insight}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-10 pt-10 border-t border-surface-200/40 dark:border-surface-700/40">
                                    <button
                                        onClick={handlePredict}
                                        className="w-full py-5 rounded-[1.25rem] bg-surface-900 dark:bg-white dark:hover:bg-brand-50 hover:bg-surface-800 text-white dark:text-surface-900 font-black transition-all flex items-center justify-center gap-3 group text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98]"
                                    >
                                        Refresh AI Model
                                        <FiArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-10 flex gap-6 items-start">
                            <div className="p-3 bg-brand-500/10 rounded-xl text-brand-600 dark:text-brand-400">
                                <FiInfo size={24} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-surface-900 dark:text-white uppercase tracking-widest">Model Ready for Deployment</h4>
                                <p className="text-sm text-surface-500 dark:text-surface-400 font-medium leading-relaxed max-w-xl">
                                    Initiate high-fidelity spending projections. Our conservative trend engine ignores anomalies and respects your set budget baselines for maximal accuracy.
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
