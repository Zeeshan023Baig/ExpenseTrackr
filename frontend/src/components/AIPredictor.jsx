import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiTrendingUp, FiInfo, FiZap, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { aiAPI } from '../services/api'
import toast from 'react-hot-toast'

const AIPredictor = ({ expenseCount }) => {
    const [loading, setLoading] = useState(false)
    const [prediction, setPrediction] = useState(null)
    const [activeTab, setActiveTab] = useState('insights') // 'insights' or 'forecast'

    const isDisabled = (expenseCount || 0) < 5

    const handlePredict = async () => {
        if (isDisabled) {
            toast.error('Please add at least 5 expenses to use AI')
            return
        }
        setLoading(true)
        try {
            const { data } = await aiAPI.predict()
            setPrediction(data)
            toast.success('AI Insights Refreshed!')
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-600 text-white rounded-2xl shadow-lg shadow-brand-500/30">
                            <FiCpu size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-surface-900 tracking-tight">AI Financial IQ</h3>
                            <p className="text-xs font-bold text-surface-500 uppercase tracking-widest tracking-tighter">Smarter spending patterns</p>
                        </div>
                    </div>

                    {prediction && (
                        <div className="flex p-1 bg-surface-200 dark:bg-surface-800 rounded-xl border border-surface-300 dark:border-surface-700">
                            <button
                                onClick={() => setActiveTab('insights')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'insights' ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
                            >
                                Smart Insights
                            </button>
                            <button
                                onClick={() => setActiveTab('forecast')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'forecast' ? 'bg-white dark:bg-surface-600 text-brand-600 dark:text-white shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
                            >
                                Forecast
                            </button>
                        </div>
                    )}

                    {!prediction && !loading && (
                        <button
                            onClick={handlePredict}
                            disabled={isDisabled}
                            className={`btn-primary py-2.5 px-6 rounded-xl group flex items-center gap-2 relative overflow-hidden ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                            <span className="relative z-10 text-sm font-bold">{isDisabled ? `Add ${5 - (expenseCount || 0)} More` : 'Analyze Spending'}</span>
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
                            <p className="text-sm font-bold text-surface-500 uppercase tracking-widest animate-pulse">De-coding your patterns...</p>
                        </motion.div>
                    ) : prediction ? (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="w-full"
                        >
                            {activeTab === 'insights' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Budget IQ Card */}
                                    <div className="p-6 bg-white dark:bg-surface-100/10 rounded-3xl border border-brand-500/20 shadow-sm col-span-1 lg:col-span-1">
                                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] mb-4">Budget Intelligence</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-surface-500 mb-1">Safe to Spend / Day</p>
                                                <p className="text-3xl font-black text-surface-900">₹{(prediction.behavioral?.dailyBudgetIQ || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
                                                <p className="text-xs font-bold text-surface-500 mb-1">Current Burn Rate</p>
                                                <p className="text-xl font-bold text-surface-700 dark:text-surface-800">₹{(prediction.behavioral?.burnRate || 0).toLocaleString('en-IN')} <span className="text-xs opacity-50">/ day</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Behavioral Insights */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Peak Day</p>
                                                <p className="text-lg font-black text-indigo-900 dark:text-indigo-100">{prediction.behavioral?.peakDay || 'Not Available'}</p>
                                            </div>
                                            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Weekend Ratio</p>
                                                <p className="text-lg font-black text-emerald-900 dark:text-emerald-100">{((prediction.behavioral?.weekendRatio || 0) * 100).toFixed(0)}% <span className="text-xs opacity-50 font-bold ml-1">of total</span></p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {prediction.insights.slice(0, 2).map((insight, idx) => (
                                                <div key={idx} className="flex gap-3 p-4 bg-surface-50 dark:bg-surface-800/10 rounded-2xl border border-surface-200 dark:border-surface-700">
                                                    <FiCheckCircle className="text-brand-500 mt-1 flex-shrink-0" size={14} />
                                                    <p className="text-xs font-medium text-surface-700 dark:text-surface-300 italic">"{insight}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="p-6 bg-white dark:bg-surface-100/10 rounded-3xl border border-brand-500/30 relative overflow-hidden">
                                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-1">Projected Monthly Total</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-surface-900 dark:text-surface-950 tracking-tighter">₹{prediction.predictedTotal.toLocaleString('en-IN')}</span>
                                                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-lg">
                                                    {prediction.confidence}% Conf
                                                </span>
                                            </div>
                                            <FiTrendingUp className="absolute top-0 right-0 p-4 opacity-5" size={80} />
                                        </div>

                                        <div className="space-y-3">
                                            {prediction.predictedCategories.slice(0, 3).map((cat, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-brand-950/20 rounded-2xl border border-surface-200/50">
                                                    <span className="text-xs font-bold text-surface-700 dark:text-surface-500">{cat.category}</span>
                                                    <span className="text-sm font-black text-surface-900">₹{cat.predictedAmount.toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between py-2">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-4">Forecast Analysis</p>
                                            <p className="text-sm font-semibold text-surface-600 leading-relaxed dark:text-surface-400">
                                                Our AI analysis shows an {prediction.predictedTotal > (prediction.behavioral.burnRate * 30) ? 'increase' : 'uptick'} in predicted spending. We recommend maintaining your daily limit of ₹{prediction.behavioral.dailyBudgetIQ.toLocaleString('en-IN')} to stay on track.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handlePredict}
                                            className="w-full mt-6 py-4 rounded-2xl bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 font-bold transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-widest"
                                        >
                                            Recalculate
                                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="py-8 flex items-start gap-4 border-t border-surface-200/20">
                            <FiInfo className="text-brand-500 mt-1 flex-shrink-0" size={18} />
                            <p className="text-sm text-surface-600 dark:text-surface-400 font-medium leading-relaxed">
                                Unlock your financial IQ. Our AI analyzes your history to give you safe daily limits, peak spending warnings, and smart trend forecasts.
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default AIPredictor
