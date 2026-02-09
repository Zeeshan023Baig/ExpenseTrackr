import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiArrowRight, FiPhone } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const Register = () => {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await register(formData)
            navigate('/')
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 md:p-10 rounded-2xl shadow-soft w-full max-w-md border border-surface-100"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-900 tracking-tight">Create Account</h2>
                    <p className="text-surface-900 mt-2">Join ExpenseTrackr today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-surface-900">Username</label>
                        <div className="relative">
                            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-800" />
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="pl-10 w-full input-field"
                                placeholder="johndoe"
                            />
                        </div>
                    </div>

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
                        <label className="block text-sm font-semibold text-surface-900">Phone Number</label>
                        <div className="relative">
                            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-800" />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="pl-10 w-full input-field"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-surface-900">Password</label>
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                        {!loading && <FiArrowRight />}
                    </button>
                </form>

                <div className="mt-8 text-center text-surface-900 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default Register
