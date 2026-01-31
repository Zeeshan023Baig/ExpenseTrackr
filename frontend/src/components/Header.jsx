import { motion } from 'framer-motion'
import { FiMenu, FiX, FiLogOut, FiPieChart } from 'react-icons/fi'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle, ColorPicker } from '../context/ThemeContext'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Analytics', path: '/expenses' },
    { label: 'Add Expense', path: '/add' },
    { label: 'Reports', path: '/reports' }
  ]

  return (
    <header className="bg-white/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="layout-container">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <FiPieChart size={20} />
            </div>
            <div className="text-xl font-bold text-surface-900 tracking-tight">ExpenseTrackr</div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <div className="flex bg-surface-100 p-1 rounded-xl">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive(item.path)
                        ? 'bg-white text-brand-600 shadow-sm'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-200/50'
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="h-8 w-px bg-surface-200 mx-4"></div>

                <div className="flex items-center gap-3">
                  <div className="hidden lg:block text-sm font-medium text-surface-600 dark:text-surface-300 mr-2">
                    <span className="text-surface-400 dark:text-surface-500 font-normal">Signed in as</span> {user?.username}
                  </div>
                  <ThemeToggle />
                  <div className="h-6 w-px bg-surface-200 dark:bg-surface-700 mx-1"></div>
                  <button
                    onClick={logout}
                    className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-surface-600 font-semibold hover:text-brand-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                >
                  Start Tracking
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-surface-600 hover:bg-surface-100 rounded-lg"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-100 py-4 space-y-2 overflow-hidden"
          >
            {isAuthenticated ? (
              <>
                <div className="px-4 pb-4 mb-2 border-b border-surface-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-surface-400 uppercase tracking-wilder">Account</div>
                    <div className="font-bold text-surface-900">{user?.username}</div>
                  </div>
                  <button onClick={logout} className="text-red-500 font-medium text-sm">Logout</button>
                </div>
                <div className="px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive(item.path)
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-surface-600 hover:bg-surface-50'
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Mobile Theme Controls */}
                  <div className="px-4 py-3 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-surface-500">Appearance</span>
                    <div className="flex bg-surface-50 dark:bg-surface-800 rounded-lg p-1 gap-2">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 text-center font-semibold text-surface-700 bg-surface-50 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 text-center font-semibold text-white bg-brand-600 rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </motion.nav>
        )}
      </div>
    </header>
  )
}

export default Header
