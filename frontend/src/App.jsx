import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ExpenseProvider } from './context/ExpenseContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Header } from './components'
import { Dashboard, ExpensesList, AddExpense, Reports, Login, Register } from './pages'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null // or a loading spinner

  return isAuthenticated ? children : <Navigate to="/login" />
}

const AppContent = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: 'easeIn'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Animated Background Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="fixed top-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-5 -mr-48 -mt-48 pointer-events-none"
      ></motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="fixed bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full opacity-5 -ml-48 -mb-48 pointer-events-none"
      ></motion.div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Private Routes */}
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/expenses" element={
                  <PrivateRoute>
                    <ExpensesList />
                  </PrivateRoute>
                } />
                <Route path="/add" element={
                  <PrivateRoute>
                    <AddExpense />
                  </PrivateRoute>
                } />
                <Route path="/reports" element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-8 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                💰 ExpenseTrackr
              </h3>
              <p className="text-blue-100 text-sm font-medium">
                Track your expenses smartly and save more every day
              </p>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h4 className="text-lg font-bold mb-3 text-blue-200 uppercase tracking-wider">Features</h4>
              <ul className="space-y-2 text-blue-100 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Easy Expense Tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  Smart Reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Category Filtering
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                  Real-time Analytics
                </li>
              </ul>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h4 className="text-lg font-bold mb-3 text-blue-200 uppercase tracking-wider">About</h4>
              <p className="text-blue-100 text-sm leading-relaxed">
                ExpenseTrackr is your personal finance assistant. Manage your spending efficiently with our intuitive interface and powerful analytics.
              </p>
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-6 origin-left"
          ></motion.div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col md:flex-row items-center justify-between"
          >
            <p className="text-blue-100 text-sm font-medium">
              © 2026 ExpenseTrackr. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <motion.a
                whileHover={{ scale: 1.1, color: '#fff' }}
                href="#"
                className="text-blue-200 text-sm font-semibold hover:text-white transition-colors"
              >
                Privacy Policy
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, color: '#fff' }}
                href="#"
                className="text-blue-200 text-sm font-semibold hover:text-white transition-colors"
              >
                Terms of Service
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, color: '#fff' }}
                href="#"
                className="text-blue-200 text-sm font-semibold hover:text-white transition-colors"
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.footer>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#000',
            borderRadius: '1rem',
            border: '2px solid #e5e7eb',
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)'
          },
          success: {
            style: {
              borderColor: '#10b981',
              background: '#ecfdf5'
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#ecfdf5'
            }
          },
          error: {
            style: {
              borderColor: '#ef4444',
              background: '#fef2f2'
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2'
            }
          }
        }}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ExpenseProvider>
          <AppContent />
        </ExpenseProvider>
      </AuthProvider>
    </Router>
  )
}

export default App