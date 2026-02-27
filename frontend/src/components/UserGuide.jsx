import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiPieChart, FiTrendingUp, FiFileText, FiCamera } from 'react-icons/fi';

const UserGuide = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show with a slight delay for better transition
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for animation
    };

    const features = [
        {
            icon: <FiPieChart className="text-brand-500" />,
            title: 'Dashboard Overview',
            desc: 'Get a quick summary of your spending, budget status, and recent transactions in one place.'
        },
        {
            icon: <FiTrendingUp className="text-purple-500" />,
            title: 'Smart Analytics',
            desc: 'Visualize your spending trends with interactive charts and track your savings goals effectively.'
        },
        {
            icon: <FiCamera className="text-blue-500" />,
            title: 'OCR Scanning',
            desc: 'Scan your receipts using AI to automatically extract expense details and save time.'
        },
        {
            icon: <FiFileText className="text-orange-500" />,
            title: 'Detailed Reports',
            desc: 'Generate comprehensive reports broken down by category and month to understand your habits.'
        }
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-3xl shadow-2xl overflow-hidden border border-surface-100 dark:border-surface-800"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
                                        Welcome to ExpenseTrackr! 👋
                                    </h2>
                                    <p className="text-surface-500 dark:text-surface-400">
                                        Your personal financial assistant is ready. Let's show you how it works.
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-full transition-colors"
                                >
                                    <FiX className="text-surface-400" size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6 mb-8">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-xl shadow-inner">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-surface-900 dark:text-white">
                                                {feature.title}
                                            </h4>
                                            <p className="text-sm text-surface-500 dark:text-surface-400">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full btn btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-glow"
                            >
                                <FiCheck size={20} />
                                <span>I'm Ready to Start!</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserGuide;
