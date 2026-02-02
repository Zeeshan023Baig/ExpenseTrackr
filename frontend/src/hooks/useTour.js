import { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export const useTour = () => {
    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
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
                    element: '#add-expense-btn',
                    popover: {
                        title: 'Add Expenses',
                        description: 'Click here to record a new expense. You can categorize them and even upload receipts!',
                        side: 'bottom'
                    }
                },
                {
                    element: '#budget-overview',
                    popover: {
                        title: 'Track Your Budget',
                        description: 'See how much of your monthly budget you\'ve used. The bar turns red if you exceed it!',
                        side: 'bottom'
                    }
                },
                {
                    element: '#stats-section',
                    popover: {
                        title: 'Key Statistics',
                        description: 'Get quick insights into your total spending, monthly average, and top spending category.',
                        side: 'top'
                    }
                },
                {
                    element: '#recent-transactions',
                    popover: {
                        title: 'Recent Transactions',
                        description: 'View your latest expenses here. You can edit or delete them if needed.',
                        side: 'top'
                    }
                }
            ]
        })

        driverObj.drive()
    }

    return { startTour }
}
