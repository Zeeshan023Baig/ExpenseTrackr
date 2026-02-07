import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
// Deployment Sync v15
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ExpenseProvider } from './context/ExpenseContext'
import { ThemeProvider } from './context/ThemeContext'
import { Header, LoadingSpinner, ChatBot } from './components'
import { Dashboard, ExpensesList, AddExpense, EditExpense, Reports, Login, Register } from './pages'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <LoadingSpinner />
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

const AppContent = () => {
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-surface-50 transition-colors duration-300 font-sans text-surface-900">
      {!isAuthPage && <Header />}

      <main className={!isAuthPage ? 'container mx-auto px-4 py-8 max-w-7xl' : ''}>
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
          <Route path="/edit/:id" element={
            <PrivateRoute>
              <EditExpense />
            </PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <ChatBot />}
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ExpenseProvider>
            <AppContent />
          </ExpenseProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App