import './index.css'
import 'driver.js/dist/driver.css'
// Forced Deploy Sync v22 (Public Repo)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Error boundary for production
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-black text-red-600 mb-3">Oops! Something went wrong</h1>
            <p className="text-gray-600 font-medium mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300"
            >
              Refresh Page
            </button>
            <details className="mt-6 text-left">
              <summary className="cursor-pointer font-bold text-red-600 mb-3">Error Details</summary>
              <pre className="bg-gray-200 p-4 rounded-lg text-xs overflow-auto max-h-48 text-gray-800 whitespace-pre-wrap">
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.error?.componentStack}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Get root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found. Please ensure <div id="root"></div> exists in index.html')
  document.body.innerHTML = '<h1>Error: Root element not found</h1>'
} else {
  // Create root and render app
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
}

// Performance monitoring (optional - for development)
if (import.meta.env.DEV) {
  // Measure Web Vitals
  const reportWebVitals = (metric) => {
    console.log('Web Vital:', metric)
  }

  // Uncomment to enable Web Vitals monitoring
  // import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
  //   getCLS(reportWebVitals)
  //   getFID(reportWebVitals)
  //   getFCP(reportWebVitals)
  //   getLCP(reportWebVitals)
  //   getTTFB(reportWebVitals)
  // })
}

// Service Worker registration (optional - for PWA support)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration)
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error)
      })
  })
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})