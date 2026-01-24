import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ExpenseProvider } from './context/ExpenseContext'
import { Header } from './components'
import { Dashboard, ExpensesList, AddExpense, Reports } from './pages'

function App() {
  return (
    <Router>
      <ExpenseProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<ExpensesList />} />
              <Route path="/add" element={<AddExpense />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff'
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981'
              }
            },
            error: {
              duration: 3000,
              style: {
                background: '#861d1d'
              }
            }
          }}
        />
      </ExpenseProvider>
    </Router>
  )
}

export default App
