import { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check if user is logged in
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('authToken')
            if (token) {
                try {
                    const { data } = await authAPI.getMe()
                    setUser(data)
                } catch (error) {
                    localStorage.removeItem('authToken')
                    setUser(null)
                }
            }
            setLoading(false)
        }

        checkLoggedIn()
    }, [])

    const login = async (credentials) => {
        try {
            const { data } = await authAPI.login(credentials)
            localStorage.setItem('authToken', data.token)
            setUser(data)
            toast.success('Login successful! Welcome back.')
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed')
            throw error
        }
    }

    const register = async (userData) => {
        try {
            const { data } = await authAPI.register(userData)
            localStorage.setItem('authToken', data.token)
            setUser(data)
            toast.success('Registration successful! Welcome.')
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('authToken')
        setUser(null)
        toast.success('Logged out successfully')
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
