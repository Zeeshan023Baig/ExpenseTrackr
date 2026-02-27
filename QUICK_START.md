# ExpenseTrackr - Quick Start Guide

## 🎯 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

## 📱 Features Overview

### Dashboard (`/`)
- Overview of total expenses
- Monthly spending summary
- Average expense calculation
- Top spending category
- Recent expenses preview
- Quick category filtering

### Expenses List (`/expenses`)
- View all expenses in a sortable list
- Search expenses by description
- Filter by category
- Sort by date or amount
- View total filtered amount
- Edit and delete individual expenses

### Add Expense (`/add`)
- Clean form to add new expenses
- Description field for details
- Amount input with validation
- Category selector
- Helpful tips displayed

### Reports (`/reports`)
- Category breakdown with percentages
- Monthly spending trends
- Highest expense highlight
- Visual charts using progress bars
- Statistical insights

### Header Navigation
- Responsive navigation menu
- Active page highlighting
- Mobile-friendly hamburger menu
- Quick access to all pages

## 💾 Data Management

### LocalStorage
- Expenses automatically save to browser storage
- Data persists between sessions
- No backend required to start using the app

### Adding Backend
The app includes an Axios API client configured for backend integration:
1. Set `VITE_API_URL` in `.env.local`
2. Use methods from `src/services/api.js`
3. Implement corresponding backend endpoints

## 🎨 Customization

### Colors & Theme
Edit `tailwind.config.js`:
```js
colors: {
  primary: '#3b82f6',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
}
```

### Categories
Edit `src/context/ExpenseContext.jsx`:
```js
const [categories, setCategories] = useState([
  'Food',
  'Transportation',
  'Entertainment',
  // Add more...
])
```

### Notifications
Configure toast settings in `src/App.jsx`:
```js
<Toaster
  position="bottom-right"
  toastOptions={{
    duration: 4000,
    // More options...
  }}
/>
```

## 🔧 Development Tips

### Component Structure
- **Pages**: Full page components (Dashboard, ExpensesList, etc.)
- **Components**: Reusable UI components (ExpenseCard, StatCard, etc.)
- **Context**: Global state (ExpenseContext)
- **Services**: API calls and utilities (api.js)

### Adding New Features

#### 1. New Page
```js
// src/pages/NewPage.jsx
import { motion } from 'framer-motion'

const NewPage = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Content */}
    </motion.div>
  )
}

export default NewPage
```

#### 2. Add Route
```js
// src/App.jsx
import NewPage from './pages/NewPage'

<Routes>
  <Route path="/new-page" element={<NewPage />} />
</Routes>
```

#### 3. Add Navigation Item
```js
// src/components/Header.jsx
const navItems = [
  { label: 'New Page', path: '/new-page' },
  // ...
]
```

## 📊 API Endpoints (Example)

When connecting to a backend, implement these endpoints:

```
GET    /api/expenses           - Get all expenses
GET    /api/expenses/:id       - Get specific expense
POST   /api/expenses           - Create expense
PUT    /api/expenses/:id       - Update expense
DELETE /api/expenses/:id       - Delete expense

GET    /api/expenses/stats     - Get statistics
GET    /api/categories         - Get categories
GET    /api/budget             - Get budget info
PUT    /api/budget             - Update budget

GET    /api/reports/monthly?month=&year= - Monthly report
GET    /api/reports/category   - Category breakdown
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the 'dist' folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Troubleshooting

### Expenses not saving?
- Check browser console for errors
- Verify localStorage is enabled
- Check .env.local configuration

### Animations not working?
- Ensure Framer Motion is installed: `npm install framer-motion`
- Check browser performance settings

### API requests failing?
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure backend server is running

## 📚 Useful Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Framer Motion](https://www.framer.com/motion/)

## 🎓 Learning Path

1. Understand React Hooks (useState, useEffect)
2. Learn Context API for state management
3. Explore Tailwind CSS utility classes
4. Study React Router for navigation
5. Practice Framer Motion animations
6. Integrate Axios for API calls

## 💡 Tips

- Use the React DevTools browser extension for debugging
- Check browser console for helpful error messages
- Use Vite's HMR for instant feedback during development
- Organize components by feature/domain
- Keep components small and focused
- Use custom hooks to share logic

---

Happy coding! 🚀
