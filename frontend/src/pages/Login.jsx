import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [resetEmail, setResetEmail] = useState('')
    const [resetLoading, setResetLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await login(formData)
            navigate('/')
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        if (!resetEmail) {
            toast.error('Please enter your email address')
            return
        }

        setResetLoading(true)
        try {
            // Simulate API call - in production, this would call your backend
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success('Password reset instructions sent to your email! 📧')
            setShowForgotPassword(false)
            setResetEmail('')
        } catch (error) {
            toast.error('Failed to send reset email. Please try again.')
        } finally {
            setResetLoading(false)
        }
    }

    return (
        <>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-100 p-8 md:p-10 rounded-2xl shadow-soft w-full max-w-md border border-surface-100"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-blue-900 tracking-tight">Welcome Back</h2>
                        <p className="text-surface-900 mt-2">Please sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-surface-900">Email Address</label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-800" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 w-full input-field"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-semibold text-surface-900">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-800" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="pl-10 w-full input-field"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <FiArrowRight />}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-surface-900 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotPassword && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForgotPassword(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-surface-100 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                                {/* Close button */}
                                <button
                                    onClick={() => setShowForgotPassword(false)}
                                    className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition-colors"
                                >
                                    <FiX size={24} />
                                </button>

                                {/* Content */}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-surface-900 mb-2">Reset Password</h3>
                                    <p className="text-surface-900 text-sm">
                                        Enter your email address and we'll send you instructions to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-surface-900 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-800" />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="pl-10 w-full input-field"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPassword(false)}
                                            className="flex-1 px-4 py-2.5 border border-surface-300 text-surface-900 rounded-xl font-semibold hover:bg-surface-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={resetLoading}
                                            className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {resetLoading ? 'Sending...' : 'Send Reset Link'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Login
