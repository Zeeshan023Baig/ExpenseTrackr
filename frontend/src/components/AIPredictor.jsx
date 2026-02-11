import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiTrendingUp, FiInfo, FiZap, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const AIPredictor = () => {
    const [loading, setLoading] = useState(false)
    const [prediction, setPrediction] = useState(null)

    const handlePredict = async () => {
        setLoading(true)
        try {
            const { data } = await aiAPI.predict()
            setPrediction(data)
            toast.success('AI Prediction Generated!')
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
            className="card p-8 bg-gradient-to-br from-surface-100 to-surface-50 dark:from-surface-100 dark:to-brand-950/20 border-none shadow-2xl relative overflow-hidden group hover:shadow-brand-500/20 transition-all duration-500"
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 dark:bg-brand-500/20 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-brand-500/20 dark:group-hover:bg-brand-500/30 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/30 animate-pulse-slow">
                            <FiCpu size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-surface-900 tracking-tight dark:text-surface-950">Expense Predictor AI</h3>
                            <p className="text-surface-500 font-medium dark:text-surface-400">Next-Gen Financial Forecasting</p>
                        </div>
                    </div>
                    {!prediction && !loading && (
                        <button
                            onClick={handlePredict}
                            className="btn-primary py-3 px-8 rounded-2xl group flex items-center gap-2 overflow-hidden relative"
                        >
                            <span className="relative z-10">Generate AI Insights</span>
                            <FiZap className="relative z-10 group-hover:animate-bounce" />
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                                <FiZap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600 animate-pulse" size={32} />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg font-black text-surface-900">AI is analyzing your patterns...</p>
                                <div className="flex gap-1 justify-center">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ scale: [1, 1.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                            className="w-2 h-2 bg-brand-500 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : prediction ? (
                        <motion.div
                            key="prediction"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <div className="space-y-6">
                                <div className="p-6 bg-white dark:bg-surface-100/10 rounded-3xl border border-surface-200 dark:border-brand-500/30 shadow-sm relative overflow-hidden">
                                    <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1 dark:text-surface-500">Expected Spend (Next 30 Days)</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-surface-900 dark:text-surface-950 tracking-tighter">₹{prediction.predictedTotal.toLocaleString()}</span>
                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                            <FiTrendingUp /> {prediction.confidence}% Confidence
                                        </span>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <FiTrendingUp size={80} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-surface-500 uppercase tracking-widest pl-1 dark:text-surface-500">Category Hotspots</h4>
                                    <div className="space-y-3">
                                        {prediction.predictedCategories.map((cat, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-brand-950/20 rounded-2xl border border-surface-200/50 dark:border-brand-500/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-brand-500 rounded-full" />
                                                    <span className="font-bold text-surface-700 dark:text-surface-800">{cat.category}</span>
                                                </div>
                                                <span className="font-black text-surface-900 dark:text-surface-950">₹{cat.predictedAmount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-surface-500 uppercase tracking-widest pl-1 dark:text-surface-500">AI Financial Recommendations</h4>
                                <div className="space-y-4">
                                    {prediction.insights.map((insight, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex gap-4 p-5 bg-brand-50/50 dark:bg-brand-500/10 rounded-3xl border border-brand-100/50 dark:border-brand-500/20"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 bg-brand-100 dark:bg-brand-500/40 text-brand-600 dark:text-brand-100 rounded-full flex items-center justify-center">
                                                <FiCheckCircle size={18} />
                                            </div>
                                            <p className="text-surface-900 dark:text-surface-900 font-semibold leading-relaxed italic line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                                                "{insight}"
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                                <button
                                    onClick={handlePredict}
                                    className="w-full py-4 rounded-2xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 font-bold transition-all flex items-center justify-center gap-2 group"
                                >
                                    Recalculate Prediction
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-12 flex items-center gap-8 border-t border-surface-200/50 dark:border-surface-700/50">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg">
                                        <FiInfo size={20} />
                                    </div>
                                    <p className="text-surface-600 dark:text-surface-400 font-medium leading-relaxed">
                                        Our AI model uses advanced pattern recognition to scan your last 100 transactions and simulate a likely spending path for the upcoming month.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default AIPredictor
