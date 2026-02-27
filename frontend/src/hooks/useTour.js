import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

const tourConfigs = {
    dashboard: [
        {
            element: '#dashboard-title',
            popover: {
                title: 'Welcome to ExpenseTrackr!',
                description: 'This is your personal finance dashboard. Let\'s take a quick tour to show you around.',
                side: 'bottom',
                align: 'start'
            }
        },
        {
            element: '#nav-analytics',
            popover: {
                title: 'Financial Analytics',
                description: 'Visualize your spending trends, set savings goals, and track your monthly budget usage in detail.',
                side: 'bottom'
            }
        },
        {
            element: '#nav-add-expense',
            popover: {
                title: 'Quick Entry',
                description: 'Easily record new expenses. You can add descriptions, categories, and manage your daily spending.',
                side: 'bottom'
            }
        },
        {
            element: '#nav-reports',
            popover: {
                title: 'Detailed Reports',
                description: 'Deep dive into your spending habits with category breakdowns and monthly trend analysis.',
                side: 'bottom'
            }
        },
        {
            element: '#budget-overview',
            popover: {
                title: 'Monthly Budget Control',
                description: 'Monitor your current spending against your monthly limit. It updates instantly with every new expense!',
                side: 'top'
            }
        },
        {
            element: '#stats-section',
            popover: {
                title: 'Key Metrics',
                description: 'A summary of your total spending, averages, and your most expensive categories at a glance.',
                side: 'top'
            }
        },
        {
            element: '#recent-transactions',
            popover: {
                title: 'Expense History',
                description: 'View and manage your most recent records. You can edit or delete them directly from here.',
                side: 'top'
            }
        }
    ],
    analytics: [
        {
            element: '#analytics-title',
            popover: {
                title: 'Welcome to Analytics!',
                description: 'Your complete financial visualization dashboard. Track spending trends, manage your budget, and plan your savings goals.',
                side: 'bottom',
                align: 'start'
            }
        },
        {
            element: '#budget-card',
            popover: {
                title: 'Monthly Budget Manager',
                description: 'View and edit your monthly budget limit. The progress bar shows how much you\'ve spent. Click the edit icon to update your budget anytime.',
                side: 'right'
            }
        },
        {
            element: '#savings-predictor',
            popover: {
                title: 'Savings Predictor',
                description: 'Set a savings goal and see how much you can spend weekly. This smart calculator helps you stay on track with your financial targets!',
                side: 'left'
            }
        },
        {
            element: '#category-chart',
            popover: {
                title: 'Spending by Category',
                description: 'Visualize where your money goes with this interactive pie chart. Each slice represents a spending category.',
                side: 'right'
            }
        },
        {
            element: '#weekly-trend',
            popover: {
                title: 'Weekly Spending Trends',
                description: 'Track your daily spending patterns over the last 7 days. Spot trends and adjust your habits accordingly.',
                side: 'left'
            }
        }
    ]
}

export const useTour = (tourType = 'dashboard') => {
    const startTour = () => {
        const steps = tourConfigs[tourType] || tourConfigs.dashboard

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            closeBtnText: 'Skip Tour',
            doneBtnText: 'Get Started',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            steps
        })

        driverObj.drive()
    }

    return { startTour }
}
