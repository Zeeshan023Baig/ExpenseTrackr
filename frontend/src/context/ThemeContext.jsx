import { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMoon, FiSun, FiCheck } from 'react-icons/fi'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme')
        return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    })

    // 'indigo' is the default brand color
    const [colorMode, setColorMode] = useState(() => {
        return localStorage.getItem('colorMode') || 'indigo'
    })

    useEffect(() => {
        const root = window.document.documentElement

        // Handle Dark Mode
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)

        // Handle Color Mode
        // Remove all previous theme classes
        const colorClasses = ['theme-indigo', 'theme-emerald', 'theme-rose', 'theme-cyan', 'theme-violet', 'theme-orange']
        root.classList.remove(...colorClasses)
        // Add new theme class
        root.classList.add(`theme-${colorMode}`)
        localStorage.setItem('colorMode', colorMode)

    }, [theme, colorMode])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    const value = {
        theme,
        toggleTheme,
        colorMode,
        setColorMode
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                ? 'bg-surface-800 text-yellow-400 hover:bg-surface-700'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
            aria-label="Toggle Dark Mode"
        >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
    )
}

export const ColorPicker = () => {
    const { colorMode, setColorMode } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    const colors = [
        { name: 'indigo', class: 'bg-indigo-500' },
        { name: 'emerald', class: 'bg-emerald-500' },
        { name: 'rose', class: 'bg-rose-500' },
        { name: 'cyan', class: 'bg-cyan-500' },
        { name: 'orange', class: 'bg-orange-500' },
        { name: 'violet', class: 'bg-violet-500' },
    ]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-brand-500 border-2 border-white dark:border-surface-800 shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                aria-label="Change Color Theme"
            >
                <span className="sr-only">Change Color</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-12 z-50 bg-white dark:bg-surface-800 p-3 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 min-w-[180px]"
                        >
                            <div className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2 px-1">
                                Theme Color
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => {
                                            setColorMode(color.name)
                                            setIsOpen(false)
                                        }}
                                        className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 relative`}
                                    >
                                        {colorMode === color.name && (
                                            <FiCheck className="text-white drop-shadow-md" size={16} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
