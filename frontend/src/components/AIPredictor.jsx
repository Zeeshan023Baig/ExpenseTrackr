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
            className="card p-8 border-none bg-gradient-to-br from-brand-600 to-indigo-700 text-white relative overflow-hidden shadow-2xl shadow-brand-500/20 rounded-[2.5rem]"
        >
            {/* Standard Background Elements to match Dashboard/Analytics */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-400/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-lg">
                            <FiCpu size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">AI Expense Forecast</h3>
                            <p className="text-brand-100 text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1 pl-0.5">Predictive Intelligence Engine</p>
                        </div>
                    </div>

                    {!prediction && !loading && (
                        <button
                            onClick={handlePredict}
                            disabled={isDisabled}
                            className={`py-3.5 px-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl group flex items-center gap-3 active:scale-95 transition-all duration-300 ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="relative z-10 text-sm font-black tracking-wide text-white">{isDisabled ? `Add ${5 - (expenseCount || 0)} More` : 'Analyze Patterns'}</span>
                            <FiZap className={`relative z-10 text-brand-200 ${isDisabled ? '' : 'group-hover:rotate-12 transition-transform'}`} size={18} />
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
                                <div className="w-20 h-20 border-[3px] border-white/10 border-t-white rounded-full animate-spin" />
                                <div className="absolute inset-2 w-16 h-16 border-[3px] border-brand-200/10 border-t-brand-200 rounded-full animate-spin [animation-duration:1s] opacity-60" />
                            </div>
                            <p className="text-xs font-black text-brand-100 uppercase tracking-[0.4em] animate-pulse">Computing Spending DNA...</p>
                        </motion.div>
                    ) : prediction ? (
                        <motion.div
                            key="prediction"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                        >
                            <div className="space-y-8">
                                <section>
                                    <p className="text-[10px] font-black text-brand-100 uppercase tracking-[0.3em] mb-4 pl-1">Projected Monthly Volume</p>
                                    <div className="p-8 bg-white/10 rounded-[2rem] border border-white/20 relative overflow-hidden group/card shadow-inner">
                                        <div className="flex items-baseline gap-3 relative z-10">
                                            <span className="text-5xl font-black text-white tracking-tighter">₹{prediction.predictedTotal.toLocaleString('en-IN')}</span>
                                            <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-500/30">
                                                {prediction.confidence}% Confidence
                                            </span>
                                        </div>
                                        <FiTrendingUp className="absolute top-0 right-0 p-6 text-white opacity-[0.05] group-hover/card:scale-110 transition-transform duration-700" size={140} />
                                    </div>
                                </section>

                                <section className="space-y-5">
                                    <div className="flex items-center justify-between px-1">
                                        <p className="text-[10px] font-black text-brand-100 uppercase tracking-[0.3em]">Category Hotspots</p>
                                        <span className="text-[10px] font-bold text-brand-200 uppercase tracking-widest opacity-60">Top 4</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {prediction.predictedCategories.slice(0, 4).map((cat, idx) => (
                                            <div key={idx} className="p-5 bg-white/10 rounded-2xl border border-white/10 hover:border-white/30 transition-all group/item backdrop-blur-sm">
                                                <span className="block text-[10px] font-black text-brand-200 uppercase tracking-widest mb-1 group-hover/item:text-white transition-colors">{cat.category}</span>
                                                <span className="text-lg font-black text-white">₹{cat.predictedAmount.toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="flex flex-col justify-between pt-1">
                                <div className="space-y-8">
                                    <p className="text-[10px] font-black text-brand-100 uppercase tracking-[0.3em] pl-1">Strategic trend analysis</p>
                                    <div className="space-y-3">
                                        {prediction.insights.slice(0, 3).map((insight, idx) => (
                                            <div key={idx} className="flex gap-5 p-6 rounded-3xl bg-white/5 hover:bg-white/10 transition-all group/insight border border-transparent hover:border-white/10 shadow-sm">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-brand-200 shadow-[0_0_12px_rgba(255,255,255,0.4)] flex-shrink-0" />
                                                <p className="text-sm font-semibold text-white/90 leading-relaxed tracking-wide italic">
                                                    "{insight}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <button
                                        onClick={handlePredict}
                                        className="w-full py-4 bg-white text-brand-600 hover:bg-brand-50 rounded-2xl flex items-center justify-center gap-3 group transition-all font-black text-sm uppercase tracking-widest shadow-xl"
                                    >
                                        Update Forecast Model
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-start gap-4 p-6 bg-white/10 rounded-3xl border border-white/10">
                            <div className="p-3 bg-white/20 rounded-xl text-white">
                                <FiInfo size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Forecast Ready</h4>
                                <p className="text-sm text-brand-100 font-medium leading-relaxed">
                                    Our prediction engine uses your actual budget and historical trends to forecast next month's volume with 95% accuracy.
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
