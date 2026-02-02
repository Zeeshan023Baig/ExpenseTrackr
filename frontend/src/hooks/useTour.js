import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export const useTour = () => {
    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            closeBtnText: 'Skip Tour',
            doneBtnText: 'Get Started',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            steps: [
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
            ]
        })

        driverObj.drive()
    }

    return { startTour }
}
