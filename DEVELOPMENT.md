# Development Guidelines

## 📋 Project Overview

ExpenseTrackr is a modern React-based expense tracking application with the following stack:

```
Frontend: Vite + React 18
Styling: Tailwind CSS + PostCSS
State: React Hooks + Context API
Routing: React Router v6
HTTP: Axios
UI: React Icons, Framer Motion, React Hot Toast
```

## 📁 File Structure Guide

```
expnsetrackr/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Header.jsx          # Navigation header
│   │   ├── ExpenseCard.jsx      # Expense display card
│   │   ├── ExpenseForm.jsx      # Add/Edit expense form
│   │   ├── StatCard.jsx         # Statistics display
│   │   ├── CategoryFilter.jsx   # Category filter buttons
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   ├── EmptyState.jsx       # Empty state display
│   │   └── index.js             # Components barrel export
│   │
│   ├── pages/                   # Page components (route destinations)
│   │   ├── Dashboard.jsx        # Home page with overview
│   │   ├── ExpensesList.jsx     # Full expenses list with filters
│   │   ├── AddExpense.jsx       # Add new expense page
│   │   ├── Reports.jsx          # Analytics and reports
│   │   └── index.js             # Pages barrel export
│   │
│   ├── context/                 # Global state management
│   │   └── ExpenseContext.jsx   # Expense state & actions
│   │
│   ├── services/                # API & utility services
│   │   └── api.js               # Axios API client
│   │
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles with Tailwind
│
├── index.html                   # HTML entry point
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS plugins
├── package.json                # Dependencies & scripts
├── .env.local                  # Environment variables (local)
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
├── QUICK_START.md              # Quick start guide
└── FEATURES.md                 # Features documentation
```

## 🔄 Component Hierarchy

```
App
├── Router
│   ├── Header (Sticky)
│   └── main
│       ├── Dashboard
│       │   ├── StatCard (x4)
│       │   ├── CategoryFilter
│       │   └── ExpenseCard (list)
│       ├── ExpensesList
│       │   ├── (Search & Sort inputs)
│       │   ├── CategoryFilter
│       │   └── ExpenseCard (list)
│       ├── AddExpense
│       │   └── ExpenseForm
│       └── Reports
│           ├── StatCard (x3)
│           ├── (Category breakdown)
│           ├── (Monthly breakdown)
│           └── (Highest expense card)
└── Toaster (Notifications)
```

## 💡 Coding Standards

### Naming Conventions

**Files & Components**
- Use PascalCase for React components: `ExpenseCard.jsx`
- Use camelCase for utility functions: `calculateTotal.js`
- Use UPPERCASE_SNAKE_CASE for constants: `DEFAULT_CATEGORY`

**Functions & Variables**
```js
// ✅ Good
const handleAddExpense = () => {}
const isExpenseValid = true
const getTotalAmount = () => {}

// ❌ Avoid
const addExpense = () => {} // Too generic
const expense_valid = true // Snake case
const total = () => {} // Not descriptive
```

**Component Props**
```js
// ✅ Good - Clear and descriptive
<ExpenseCard 
  expense={expense}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// ❌ Avoid - Unclear callbacks
<ExpenseCard 
  data={expense}
  callback={handleEdit}
/>
```

### Code Organization

**Component Structure**
```jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Icon } from 'react-icons/fi'

const MyComponent = ({ prop1, prop2 }) => {
  // 1. State declarations
  const [state, setState] = useState('')
  
  // 2. Context usage
  const { data } = useContext(Context)
  
  // 3. Other hooks
  const memoized = useMemo(() => { /* ... */ }, [dep])
  const callback = useCallback(() => { /* ... */ }, [dep])
  
  // 4. Helper functions
  const handleEvent = () => { /* ... */ }
  
  // 5. Effects
  useEffect(() => { /* ... */ }, [deps])
  
  // 6. Render
  return (
    <motion.div>
      {/* Content */}
    </motion.div>
  )
}

export default MyComponent
```

### Import Organization
```js
// 1. React imports
import React, { useState, useEffect } from 'react'

// 2. External library imports
import { motion } from 'framer-motion'
import { FiHome } from 'react-icons/fi'
import axios from 'axios'

// 3. Internal imports
import { Header } from '@/components'
import { Dashboard } from '@/pages'
import { ExpenseContext } from '@/context'
import { api } from '@/services'

// 4. Styles
import '@/styles.css'
```

## 🎯 Best Practices

### State Management

**Use Context API for Global State**
```js
// ✅ Good - For global state
const { expenses, addExpense } = useContext(ExpenseContext)

// ❌ Avoid - Passing through many components
<Component expense={expense} setExpense={setExpense} />
```

**Use Local State for Component State**
```js
// ✅ Good - Local form state
const [formData, setFormData] = useState({ name: '', amount: '' })

// ❌ Avoid - Global state for temporary UI state
// (Unless needed across multiple components)
```

### Performance

**Memoization**
```js
// Memoize expensive calculations
const totalExpenses = useMemo(
  () => expenses.reduce((sum, exp) => sum + exp.amount, 0),
  [expenses]
)

// Memoize callbacks passed to children
const handleDelete = useCallback(
  (id) => deleteExpense(id),
  [deleteExpense]
)
```

**Avoid Unnecessary Re-renders**
```js
// ✅ Good - Filtered expenses array changes only when needed
const filtered = useMemo(
  () => expenses.filter(exp => exp.category === selected),
  [expenses, selected]
)

// ❌ Avoid - New array every render
const filtered = expenses.filter(exp => exp.category === selected)
```

### Error Handling

```js
// ✅ Good error handling
try {
  const result = await api.addExpense(data)
  toast.success('Expense added!')
} catch (error) {
  console.error('Add expense error:', error)
  toast.error(error.message || 'Failed to add expense')
}

// ✅ Form validation
if (!formData.description.trim()) {
  toast.error('Description is required')
  return
}

if (formData.amount <= 0) {
  toast.error('Amount must be greater than 0')
  return
}
```

### Accessibility

```jsx
// ✅ Good accessibility
<button 
  onClick={handleDelete}
  title="Delete expense"
  aria-label="Delete expense"
  className="p-2"
>
  <FiTrash2 />
</button>

// Use semantic HTML
<form onSubmit={handleSubmit}>
  <label htmlFor="amount">Amount</label>
  <input id="amount" type="number" />
</form>
```

## 🧪 Testing Guidelines

### Component Testing
```js
// Example test structure
import { render, screen } from '@testing-library/react'
import ExpenseCard from '@/components/ExpenseCard'

describe('ExpenseCard', () => {
  it('displays expense details', () => {
    const expense = { id: '1', description: 'Test', amount: 50 }
    render(<ExpenseCard expense={expense} />)
    
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
  })
})
```

## 📦 Adding Dependencies

### Install Package
```bash
npm install package-name
```

### Update Import Paths
```js
// Add to vite.config.js if needed
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

## 🚀 Build & Deployment

### Development
```bash
npm run dev              # Start dev server (HMR enabled)
```

### Production
```bash
npm run build            # Create optimized build
npm run preview          # Preview production build locally
```

### Environment Variables
Create `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

## 🐛 Debugging

### Browser DevTools
1. React DevTools browser extension
2. Network tab for API calls
3. Application/Storage tab for localStorage
4. Console for error messages

### Console Logging
```js
// Good practices
console.log('Component mounted')
console.error('API Error:', error)
console.warn('Deprecated method used')

// Use descriptive messages
console.log('User deleted expense:', expenseId)
```

### React DevTools
- Inspect component hierarchy
- Track props and state changes
- Profile performance
- Highlight re-renders

## 📚 Documentation

### Commenting Guidelines
```js
// Use comments for WHY, not WHAT
// ✅ Good - Explains the reason
// We memoize this because calculating total is expensive
const total = useMemo(() => { ... }, [expenses])

// ❌ Poor - Just states what the code does
// Calculate the total
const total = useMemo(() => { ... }, [expenses])
```

### JSDoc Comments
```js
/**
 * Calculates total expenses for a category
 * @param {Array} expenses - Array of expense objects
 * @param {string} category - Category to filter by
 * @returns {number} Total amount for category
 */
const getCategoryTotal = (expenses, category) => {
  return expenses
    .filter(exp => exp.category === category)
    .reduce((sum, exp) => sum + exp.amount, 0)
}
```

## 🔄 Git Workflow

### Commit Messages
```
✨ Feature: Add expense filtering
🐛 Fix: Handle null expense data
📝 Docs: Update README
♻️ Refactor: Simplify expense context
🧹 Chore: Update dependencies
```

### Branch Naming
```
feature/add-budget-limits
fix/expense-deletion-bug
docs/api-documentation
refactor/simplify-context
```

## 🎨 Tailwind CSS Usage

### Common Patterns
```jsx
// Spacing
<div className="mt-4 mb-2 px-6">

// Flexbox
<div className="flex items-center justify-between gap-4">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Responsive
<div className="text-sm md:text-base lg:text-lg">

// Colors & Backgrounds
<div className="bg-blue-50 text-blue-900 rounded-lg">

// States
<button className="hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50">
```

## 🚨 Common Pitfalls to Avoid

1. **Missing Dependencies in useEffect**
   ```js
   // ❌ Wrong - infinite loop
   useEffect(() => {
     fetchData()  // fetchData not in dependencies
   }, [])
   
   // ✅ Correct
   useEffect(() => {
     fetchData()
   }, [fetchData])
   ```

2. **Direct State Mutation**
   ```js
   // ❌ Wrong - direct mutation
   state.expenses.push(newExpense)
   
   // ✅ Correct - new array
   setState([...state, newExpense])
   ```

3. **Memory Leaks**
   ```js
   // ✅ Correct - cleanup effect
   useEffect(() => {
     const subscription = api.subscribe()
     return () => subscription.unsubscribe()
   }, [])
   ```

4. **Unnecessary Re-renders**
   ```js
   // ✅ Memoize component if receiving same props
   export default React.memo(ExpenseCard)
   ```

## 📞 Getting Help

1. Check FEATURES.md for feature documentation
2. Review QUICK_START.md for setup help
3. Check browser console for error messages
4. Use React DevTools for component debugging
5. Review git commit history for changes

---

**Keep code clean, documented, and performant!** ✨
