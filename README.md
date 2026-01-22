# 💰 ExpenseTrackr

A modern, full-featured expense tracking application built with Vite + React. Track your spending, categorize expenses, and visualize your financial habits with beautiful analytics and reports.

## 🚀 Features

- **Dashboard**: Quick overview of your expenses with key statistics
- **Expense Management**: Add, view, edit, and delete expenses
- **Category Filtering**: Filter and organize expenses by category
- **Advanced Search**: Find expenses quickly with powerful search
- **Reports & Analytics**: Visual breakdown of spending by category and month
- **Statistics**: Track total expenses, averages, and trends
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Notifications**: Toast notifications for all actions
- **Smooth Animations**: Beautiful transitions with Framer Motion
- **Local Storage**: Your data persists automatically

## 🛠️ Tech Stack

### Core
- **Vite** - Lightning-fast build tool
- **React 18** - Modern UI library
- **JavaScript (ES6+)** - Latest JavaScript features

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

### Features
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Icons** - Icon library
- **Framer Motion** - Animation library
- **React Hot Toast** - Notification system

### State Management
- **React Hooks** - useState, useEffect for local state
- **Context API** - Global state management

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd expnsetrackr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will open automatically at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── ExpenseCard.jsx
│   ├── StatCard.jsx
│   ├── ExpenseForm.jsx
│   ├── CategoryFilter.jsx
│   ├── LoadingSpinner.jsx
│   ├── EmptyState.jsx
│   └── index.js
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── ExpensesList.jsx
│   ├── AddExpense.jsx
│   ├── Reports.jsx
│   └── index.js
├── context/            # Context API for state
│   └── ExpenseContext.jsx
├── services/           # API and utility services
│   └── api.js
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## 🎯 How to Use

### Adding an Expense
1. Click on "Add Expense" in the navigation
2. Fill in the description, amount, and category
3. Click "Add Expense" to save

### Viewing Expenses
- **Dashboard**: See recent expenses and key statistics
- **Expenses List**: View all expenses with search and filter options
- **Reports**: Analyze spending patterns with charts and breakdowns

### Filtering and Searching
- Use category filters to view specific spending categories
- Use the search bar to find expenses by description
- Sort by date or amount in the expenses list

### Deleting Expenses
- Click the trash icon on any expense card to delete
- Confirm the deletion in the notification

## 🎨 Customization

### Tailwind Configuration
Edit `tailwind.config.js` to customize colors and theme:
```js
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      // Add more custom colors
    }
  }
}
```

### Adding Categories
Edit the categories array in `ExpenseContext.jsx`:
```js
const [categories, setCategories] = useState([
  'Food',
  'Transportation',
  // Add more categories
])
```

## 📡 API Integration

The app includes an Axios-based API service in `src/services/api.js`. To connect to a backend:

1. Set your API URL in `.env.local`:
   ```
   VITE_API_URL=http://your-api.com/api
   ```

2. Use the API methods:
   ```js
   import { expenseAPI } from '@/services/api'
   
   const expenses = await expenseAPI.getAllExpenses()
   ```

## 🌐 Environment Variables

Create a `.env.local` file:
```
VITE_API_URL=http://localhost:5000/api
```

## 🔒 Data Storage

- Expenses are saved in browser's localStorage by default
- Authentication tokens can be stored and automatically sent with API requests
- Data persists between browser sessions

## 🚀 Performance

- **Lazy Rendering**: Components only render when needed
- **Optimized Re-renders**: Using React.memo and useMemo
- **Fast Build**: Vite provides instant HMR (Hot Module Replacement)
- **Minimal Bundle**: Tree-shaking removes unused code

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork, modify, and use this project for your needs!

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Happy Tracking! 💰✨**
