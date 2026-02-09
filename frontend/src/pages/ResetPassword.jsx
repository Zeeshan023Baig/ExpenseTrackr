import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLock, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (passwords.password !== passwords.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (passwords.password.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        setLoading(true)
        try {
            await authAPI.resetPassword(token, passwords.password)
            toast.success('Password reset successful! 🎉')
            setSuccess(true)
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface-100 p-8 md:p-10 rounded-2xl shadow-soft w-full max-w-md border border-surface-100 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                            <FiCheckCircle size={48} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-surface-900 mb-4">Password Updated</h2>
                    <p className="text-surface-900 mb-8">
                        Your password has been successfully reset. You will be redirected to the login page in a few seconds.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full btn-primary py-3"
                    >
                        Go to Login Now
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-100 p-8 md:p-10 rounded-2xl shadow-soft w-full max-w-md border border-surface-100"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-900 tracking-tight">Create New Password</h2>
                    <p className="text-surface-900 mt-2">Enter your new secure password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-surface-900">New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-800" />
                            <input
                                type="password"
                                name="password"
                                required
                                value={passwords.password}
                                onChange={handleChange}
                                className="pl-10 w-full input-field"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-surface-900">Confirm New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-800" />
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={passwords.confirmPassword}
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
                        {loading ? 'Updating Password...' : 'Reset Password'}
                        {!loading && <FiArrowRight />}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

export default ResetPassword
