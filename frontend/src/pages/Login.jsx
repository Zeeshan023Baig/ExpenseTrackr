import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
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
            await login(formData)
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
                    <h2 className="text-3xl font-bold text-surface-900 tracking-tight">Welcome Back</h2>
                    <p className="text-surface-500 mt-2">Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-surface-700">Email Address</label>
                        <div className="relative">
                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
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
                        <label className="block text-sm font-semibold text-surface-700">Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
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

                <div className="mt-8 text-center text-surface-500 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700 hover:underline">
                        Sign up
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default Login
