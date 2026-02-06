/**
 * Page Exports
 * Centralized export file for all application pages/routes
 * 
 * Pages:
 * - Dashboard: Main dashboard with overview and stats
 * - ExpensesList: Full list of expenses with filters
 * - AddExpense: Page for adding new expenses
 * - Reports: Analytics and reporting page
 * - EditExpense: Page for editing existing expenses
 */

// Main Pages
import Dashboard from './Dashboard'
import ExpensesList from './ExpensesList'
import AddExpense from './AddExpense'
import EditExpense from './EditExpense'
import Reports from './Reports'
import Login from './Login'
import Register from './Register'

export {
    Dashboard,
    ExpensesList,
    AddExpense,
    EditExpense,
    Reports,
    Login,
    Register
}