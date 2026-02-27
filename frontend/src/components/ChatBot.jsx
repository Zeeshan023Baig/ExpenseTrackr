import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi'

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: "Hi! 👋 I'm your ExpenseTrackr assistant. How can I help you today?",
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')

    // Predefined Q&A responses
    const qaDatabase = {
        greetings: {
            keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
            response: "Hello! How can I assist you with ExpenseTrackr today? 😊"
        },
        budget: {
            keywords: ['budget', 'set budget', 'change budget', 'monthly limit'],
            response: "To set or update your budget, go to the Analytics page and click the edit icon (✏️) next to your budget amount. You can adjust it anytime!"
        },
        addExpense: {
            keywords: ['add expense', 'create expense', 'new expense', 'record expense'],
            response: "To add a new expense:\n1. Click 'Add Expense' in the navigation\n2. Fill in the amount, description, and category\n3. Click 'Add Expense' button\n\nYou can also use the quick button on the Dashboard!"
        },
        categories: {
            keywords: ['category', 'categories', 'what categories'],
            response: "ExpenseTrackr includes these categories:\n• Food\n• Transportation\n• Entertainment\n• Utilities\n• Healthcare\n• Shopping\n• Other\n\nChoose the one that best fits your expense!"
        },
        analytics: {
            keywords: ['analytics', 'charts', 'graphs', 'visualize', 'trends'],
            response: "The Analytics page shows:\n• Budget overview with progress bar\n• Savings predictor tool\n• Spending by category (pie chart)\n• 7-day spending trend (bar chart)\n\nClick 'Analytics' in the navigation to explore!"
        },
        reports: {
            keywords: ['reports', 'detailed reports', 'breakdown'],
            response: "The Reports page provides:\n• Total expenses summary\n• Category breakdown with percentages\n• Monthly spending trends\n• Transaction counts per category\n\nGreat for detailed analysis!"
        },
        savings: {
            keywords: ['savings', 'save money', 'savings goal', 'weekly spend'],
            response: "Use the Savings Predictor on the Analytics page!\n\nYou can:\n• Set a savings goal to see your max weekly spend\n• OR set a weekly spending limit to see how much you'll save\n\nIt calculates automatically based on your budget!"
        },
        delete: {
            keywords: ['delete', 'remove expense', 'delete expense'],
            response: "To delete an expense:\n1. Find it in your expense list (Dashboard or Analytics)\n2. Click the delete/trash icon\n3. Confirm the deletion\n\nNote: This action cannot be undone!"
        },
        help: {
            keywords: ['help', 'guide', 'tour', 'how to use'],
            response: "Need a guided tour? Click the 'Quick Guide' button on the Dashboard or Analytics page to start an interactive walkthrough of all features! 🎯"
        },
        features: {
            keywords: ['features', 'what can', 'capabilities'],
            response: "ExpenseTrackr features:\n✅ Track all your expenses\n✅ Set monthly budgets\n✅ Visualize spending with charts\n✅ Category-based organization\n✅ Savings goal planning\n✅ Detailed reports\n✅ Real-time budget tracking"
        }
    }

    const getBotResponse = (userMessage) => {
        const message = userMessage.toLowerCase().trim()

        // Check for matches in Q&A database
        for (const [key, qa] of Object.entries(qaDatabase)) {
            if (qa.keywords.some(keyword => message.includes(keyword))) {
                return qa.response
            }
        }

        // Default response if no match found
        return "I'm here to help! Try asking about:\n• Adding expenses\n• Setting budgets\n• Using analytics\n• Viewing reports\n• Savings goals\n• Categories\n\nOr type 'help' for a tour guide!"
    }

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        // Add user message
        const userMessage = {
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])

        // Get and add bot response
        setTimeout(() => {
            const botResponse = {
                type: 'bot',
                text: getBotResponse(inputValue),
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
        }, 500)

        setInputValue('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage()
        }
    }

    const quickQuestions = [
        "How do I add an expense?",
        "How do I set my budget?",
        "What are the categories?",
        "Show me the features"
    ]

    const handleQuickQuestion = (question) => {
        setInputValue(question)
        setTimeout(() => handleSendMessage(), 100)
    }

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-brand-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-brand-500/50 transition-all hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-surface-200 dark:border-surface-700"
                    >
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-brand-600 to-purple-600 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <FiMessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">ExpenseTrackr Assistant</h3>
                                    <p className="text-xs text-blue-100">Always here to help!</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50 dark:bg-surface-900">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.type === 'user'
                                            ? 'bg-brand-600 text-white rounded-br-sm'
                                            : 'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700 rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Quick Questions */}
                            {messages.length === 1 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-surface-700 dark:text-surface-300 font-semibold">Quick questions:</p>
                                    {quickQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickQuestion(question)}
                                            className="block w-full text-left text-sm p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 transition-colors text-surface-800 dark:text-surface-200 font-medium"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything..."
                                    className="flex-1 px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-surface-900 dark:text-surface-100"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FiSend size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default ChatBot
