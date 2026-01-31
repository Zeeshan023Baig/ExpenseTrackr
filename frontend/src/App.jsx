import { ThemeProvider } from './context/ThemeContext'
// ... (imports)

// ...

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