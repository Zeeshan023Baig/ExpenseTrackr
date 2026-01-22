# ExpenseTrackr - Features Documentation

## 🎨 UI Components

### 1. Header Component
**Location**: `src/components/Header.jsx`

Features:
- Sticky navigation bar
- Responsive mobile menu with hamburger icon
- Active page highlighting
- Logo with emoji
- Smooth animations with Framer Motion

```jsx
<Header />
```

### 2. Expense Card
**Location**: `src/components/ExpenseCard.jsx`

Features:
- Display expense details
- Color-coded category badges
- Edit and delete buttons
- Formatted date display
- Smooth entry/exit animations

```jsx
<ExpenseCard 
  expense={expense}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 3. Stat Card
**Location**: `src/components/StatCard.jsx`

Features:
- Display statistics with icons
- Customizable colors (blue, green, red, purple)
- Scale animation on load
- Responsive layout

```jsx
<StatCard
  title="Total Expenses"
  value="$1,234.56"
  icon={FiTrendingDown}
  color="blue"
/>
```

### 4. Expense Form
**Location**: `src/components/ExpenseForm.jsx`

Features:
- Add and edit expenses
- Description input with validation
- Amount input with currency format
- Category dropdown selector
- Form validation with toast notifications
- Optional cancel button for editing

```jsx
<ExpenseForm 
  onSubmit={handleSubmit}
  initialData={expense}
  onCancel={handleCancel}
/>
```

### 5. Category Filter
**Location**: `src/components/CategoryFilter.jsx`

Features:
- Filter by category
- Show all option
- Highlight selected category
- Smooth button transitions

```jsx
<CategoryFilter
  categories={categories}
  selected={selectedCategory}
  onSelect={setSelectedCategory}
/>
```

### 6. Loading Spinner
**Location**: `src/components/LoadingSpinner.jsx`

Features:
- Animated rotating spinner
- Clean design
- Used for async operations

```jsx
{loading && <LoadingSpinner />}
```

### 7. Empty State
**Location**: `src/components/EmptyState.jsx`

Features:
- Display when no data available
- Customizable icon and message
- Centered layout with icon

```jsx
<EmptyState message="No expenses found" />
```

## 📄 Pages

### 1. Dashboard (`/`)
**Location**: `src/pages/Dashboard.jsx`

Features:
- **Statistics**: Total, monthly, average, and top category
- **Recent Expenses**: Last 5 expenses preview
- **Category Filter**: Quick filter expenses
- **Key Metrics**: 
  - Total Expenses
  - This Month Total
  - Average per Expense
  - Top Spending Category

### 2. Expenses List (`/expenses`)
**Location**: `src/pages/ExpensesList.jsx`

Features:
- **Search**: Find expenses by description
- **Sorting**: By newest, oldest, highest, or lowest amount
- **Filtering**: By category
- **Summary**: Shows total and count of filtered expenses
- **CRUD Operations**: View, edit, delete expenses
- **Actions**:
  - Edit: Modify expense details
  - Delete: Remove expense with confirmation

### 3. Add Expense (`/add`)
**Location**: `src/pages/AddExpense.jsx`

Features:
- **Form**: Simple expense creation form
- **Validation**: Ensures valid inputs
- **Categories**: Dropdown with predefined categories
- **Tips**: Helpful suggestions for tracking
- **Navigation**: Auto-redirect after adding

### 4. Reports (`/reports`)
**Location**: `src/pages/Reports.jsx`

Features:
- **Statistics**:
  - Total spent amount
  - Total transactions count
  - Average expense per transaction
- **Category Breakdown**:
  - Percentage distribution
  - Amount per category
  - Transaction count per category
  - Animated progress bars
- **Monthly Breakdown**:
  - Spending trend visualization
  - Monthly totals
  - Comparative analysis
- **Highest Expense**:
  - Highlights top expense
  - Shows details

## 🔧 Context & State Management

### ExpenseContext
**Location**: `src/context/ExpenseContext.jsx`

Manages:
```js
{
  expenses,           // Array of all expenses
  categories,         // Array of categories
  loading,            // Loading state
  error,              // Error messages
  
  // Methods
  addExpense(expense),
  deleteExpense(id),
  updateExpense(id, updates),
  getExpensesByCategory(category),
  getTotalExpenses(),
  getExpensesByDateRange(startDate, endDate)
}
```

Features:
- LocalStorage persistence
- Automatic data synchronization
- Error handling
- Memoized selectors

## 📡 API Services

### Axios API Client
**Location**: `src/services/api.js`

Features:
- **Interceptors**:
  - Automatic token attachment
  - Error handling and logging
  - 401 redirect on auth failure
- **Endpoints**:
  ```js
  expenseAPI.getAllExpenses()
  expenseAPI.getExpenseById(id)
  expenseAPI.createExpense(data)
  expenseAPI.updateExpense(id, data)
  expenseAPI.deleteExpense(id)
  expenseAPI.getExpenseStats()
  expenseAPI.getCategories()
  expenseAPI.getBudget()
  expenseAPI.updateBudget(data)
  expenseAPI.getMonthlyReport(month, year)
  expenseAPI.getCategoryReport()
  ```

## 🎨 Styling

### Tailwind CSS
- Custom colors defined in `tailwind.config.js`
- Component utilities in `index.css`
- Responsive breakpoints: sm, md, lg
- Dark mode ready (commented out)

### Custom Classes
```css
.btn-primary        /* Blue button */
.btn-secondary      /* Green button */
.btn-danger         /* Red button */
.card               /* Card styling */
.input-field        /* Form input styling */
```

## 🎭 Animations

### Framer Motion Features
- **Page Transitions**: Fade and slide animations
- **Component Animations**:
  - Scale animations for cards
  - Staggered list animations
  - Hover effects on buttons
  - Exit animations for deleted items
- **Progress Bar Animations**: Animated width transitions

## 🔔 Notifications

### React Hot Toast
Configured notifications for:
- ✅ Success: Green background, 3s duration
- ❌ Error: Red background, 3s duration
- ℹ️ Info: Gray background, 4s duration

Position: Bottom-right of screen

## 🔍 Data Filtering & Sorting

### Filtering Options
- By category
- By search term
- By date range (prepared)

### Sorting Options
- Newest first (default)
- Oldest first
- Highest amount first
- Lowest amount first

## 📊 Analytics Features

### Dashboard Statistics
- Total expenses sum
- Monthly expenses total
- Average expense calculation
- Top spending category

### Reports Analytics
- Category distribution percentages
- Monthly spending trends
- Highest expense tracking
- Transaction counts per category

## 💾 Data Persistence

### LocalStorage
- Automatic save on expense change
- Load on app initialization
- Clear history capability (manual)

### Backend Ready
- Configured with Axios
- API interceptors set up
- Token management built-in
- Environment variable support

## 🔐 Security Features

- Local authentication token handling
- Secure API requests with bearer tokens
- Protected routes ready
- Error boundary considerations

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Components
- Navigation collapses to hamburger menu
- Grid layouts adapt to screen size
- Forms stack on mobile
- Statistics cards stack on small screens

## ⚡ Performance Optimizations

### Memoization
- `useMemo` for expensive calculations
- `useCallback` for event handlers
- Context optimization to prevent unnecessary re-renders

### Lazy Loading Ready
- Route-based code splitting available
- Image optimization placeholders

## 🛠️ Developer Features

### Development Tools
- Hot Module Replacement (HMR)
- React DevTools compatible
- Console logging for debugging
- Error boundaries ready

### Code Organization
- Feature-based folder structure
- Reusable component library
- Centralized API services
- Context-based state management

## 🎯 Future Enhancement Ideas

1. **Authentication**: Login/signup system
2. **Recurring Expenses**: Set up monthly/weekly expenses
3. **Budget Limits**: Set category budgets with alerts
4. **Export Data**: CSV/PDF export functionality
5. **Multi-device Sync**: Cloud sync with backend
6. **Tags**: Add tags to expenses for better categorization
7. **Attachments**: Upload receipts
8. **Notifications**: Budget alerts
9. **Dark Mode**: Toggle theme
10. **Multi-currency**: Support different currencies

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready ✅
