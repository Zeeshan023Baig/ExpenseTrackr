import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiType, FiTag, FiUpload, FiLoader } from 'react-icons/fi'
import { FaRupeeSign } from 'react-icons/fa'
import { ExpenseContext } from '../context/ExpenseContext'
import Tesseract from 'tesseract.js'

const ExpenseForm = ({ onSubmit, initialData = null, onCancel }) => {
  const { categories, addCategory } = useContext(ExpenseContext)
  const [isScanning, setIsScanning] = useState(false)
  const [formData, setFormData] = useState(
    initialData || {
      description: '',
      amount: '',
      category: 'Other'
    }
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsScanning(true)
    toast.loading('Scanning receipt...', { id: 'scan' })

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      })

      const text = result.data.text
      console.log('scanned text:', text)

      // 1. Clean and normalize text
      const lines = text.split('\n').map(line => line.trim().toUpperCase())

      // 2. Look for keywords that usually precede the total
      const totalKeywords = ['TOTAL', 'GRAND TOTAL', 'NET AMOUNT', 'PAYABLE', 'AMOUNT DUE', 'SUM', 'TOTAL:', 'RS', 'INR']
      let extractedAmount = null

      // Strategy A: Look for numbers on the same line or next line as keywords
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const hasKeyword = totalKeywords.some(kw => line.includes(kw))

        if (hasKeyword) {
          // Find potential numbers in this line or the next
          const searchArea = line + (lines[i + 1] || '')
          const matches = searchArea.match(/[\d,]+(\.\d{1,2})?/g)

          if (matches) {
            const potentials = matches
              .map(m => parseFloat(m.replace(/,/g, '')))
              .filter(n => n > 0 && n < 1000000) // Sanity check

            if (potentials.length > 0) {
              // Usually the last number in "Total" context is the value
              extractedAmount = potentials[potentials.length - 1]
              break
            }
          }
        }
      }

      // Strategy B: Fallback to largest number (excluding likely dates)
      if (!extractedAmount) {
        const allMatches = text.match(/[\d,]+(\.\d{1,2})?/g)
        if (allMatches) {
          const validNumbers = allMatches
            .map(m => parseFloat(m.replace(/,/g, '')))
            .filter(n => {
              // Filter out obvious years (e.g., 2023, 2024, 2025)
              if (n >= 2000 && n <= 2100) return false
              return n > 0 && n < 1000000
            })

          if (validNumbers.length > 0) {
            extractedAmount = Math.max(...validNumbers)
          }
        }
      }

      if (extractedAmount) {
        setFormData(prev => ({ ...prev, amount: extractedAmount }))
        toast.success(`Found amount: ₹${extractedAmount}`, { id: 'scan' })
      } else {
        toast.error('Could not extract amount. Please enter manually.', { id: 'scan' })
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to scan receipt', { id: 'scan' })
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // Add category if it's new
    const trimmedCategory = formData.category.trim()
    if (trimmedCategory && !categories.includes(trimmedCategory)) {
      addCategory(trimmedCategory)
    }

    onSubmit({ ...formData, category: trimmedCategory || 'Other' })

    if (!initialData) {
      setFormData({ description: '', amount: '', category: '' })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Receipt Scanner */}
      {!initialData && (
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isScanning}
          />
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isScanning ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-brand-400 hover:bg-surface-50'
            }`}>
            <div className="flex flex-col items-center gap-2 text-surface-500 group-hover:text-brand-600">
              {isScanning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <FiLoader size={24} />
                </motion.div>
              ) : (
                <FiUpload size={24} />
              )}
              <span className="text-sm font-medium">
                {isScanning ? 'Scanning Receipt...' : 'Scan Receipt / Screenshot'}
              </span>
              <span className="text-xs text-surface-400">
                Upload to auto-fill amount
              </span>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-surface-900 mb-2">
          Description
        </label>
        <div className="relative">
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Lunch at restaurant"
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-surface-900 mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-surface-900 mb-2">
            Category
          </label>
          <div className="relative">
            <input
              list="category-list"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Select or type..."
              className="input-field"
            />
            <datalist id="category-list">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all duration-300"
          disabled={isScanning}
        >
          {initialData ? 'Update Expense' : 'Add Expense'}
        </motion.button>
        {onCancel && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 bg-surface-100 text-surface-700 rounded-xl font-bold hover:bg-surface-200 transition-colors"
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.form>
  )
}

export default ExpenseForm
