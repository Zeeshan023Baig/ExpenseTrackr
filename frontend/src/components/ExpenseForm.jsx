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
      const lines = text.split('\n').map(line => line.trim())

      // 2. Comprehensive Keywords
      const highConfidenceKeywords = ['TOTAL', 'GRAND', 'NET', 'PAYABLE', 'AMOUNT', 'SUM', '₹', 'RS.', 'RS ', 'INR', 'SENT TO', 'PAID TO', 'TRANSFER SUCCESSFUL']
      const standardKeywords = ['DUE', 'AMT', 'PABLE', 'CASH', 'PAID', 'BILLED', 'SENT', 'TO', 'SUCCESSFUL', 'DONE']
      const negativeKeywords = ['ID', 'REF', 'BANK', 'A/C', 'ACCOUNT', 'TRANS', 'PHONE', 'NO:', 'DATE', 'TIME', 'CLOCK', 'MOBILE', 'BATTERY', 'SIGNAL']

      let candidates = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase()
        // Aggressive status bar filter (top 15-20% of typical mobile screen)
        const IS_TOP_SECTION = i < 15

        // CRITICAL: Look for clock-like patterns (14:42, 2:45PM, or just 14 42)
        const HAS_CLOCK_SYMBOL = line.includes(':') || line.includes('PM') || line.includes('AM')
        const IS_CLOCK_FORMAT = line.match(/\d{1,2}\s?[:\s]\s?\d{2}/)

        const matches = line.match(/(?:₹|RS|INR|RS.|S|Z)?\s?([\d,]+(?:\.\d{1,2})?)/gi)

        if (matches) {
          matches.forEach(match => {
            const numStr = match.replace(/[^\d.]/g, '')
            const num = parseFloat(numStr)

            if (isNaN(num) || num <= 0 || num > 1000000) return

            // DETECTION: Is this an actual currency symbol or an OCR mistake?
            const hasExplicitCurrency = match.includes('₹') || match.includes('RS') || match.includes('INR')

            // Tesseract often misreads ":" as "S" or "Z".
            let isMarkedAsMoney = hasExplicitCurrency
            if (!hasExplicitCurrency && (match.startsWith('S') || match.startsWith('Z'))) {
              if (!HAS_CLOCK_SYMBOL && !IS_CLOCK_FORMAT) {
                isMarkedAsMoney = true
              }
            }

            // AGGRESSIVE CLOCK FILTER: 
            // If it's on a line that looks like a clock or status bar and it's small, it IS the clock.
            if ((HAS_CLOCK_SYMBOL || IS_CLOCK_FORMAT) && num < 60 && !hasExplicitCurrency) {
              return
            }

            // FILTER: Special Case for Status Bar (Top of Image)
            // Most clock digits are at the very top. If we see a small number 
            // at the very top without a currency symbol, we ignore it.
            if (IS_TOP_SECTION && num < 60 && !hasExplicitCurrency) {
              return
            }

            // FILTER: Long unformatted numbers (IDs/Phones)
            if (numStr.length >= 7 && !numStr.includes('.') && !isMarkedAsMoney) return

            let score = 0

            // SCORING
            if (highConfidenceKeywords.some(kw => line.includes(kw))) score += 100
            if (line.includes('SUCCESSFUL') || line.includes('DONE') || line.includes('PAID')) score += 80
            if (standardKeywords.some(kw => line.includes(kw))) score += 40

            // Weighting
            if (hasExplicitCurrency) score += 600 // Even bigger trust in explicit symbol
            if (isMarkedAsMoney && !hasExplicitCurrency) score += 100

            if (numStr.includes('.')) score += 30

            // Penalty for top section
            if (IS_TOP_SECTION && !isMarkedAsMoney) score -= 500

            // PENALTY: Negative context
            if (negativeKeywords.some(kw => line.includes(kw)) && !isMarkedAsMoney) score -= 300

            candidates.push({
              value: num,
              score,
              text: match,
              line: line,
              hasCurrency: isMarkedAsMoney
            })
          })
        }
      }

      // Priority sort: Candidates with explicit currency symbols (₹, RS) ALWAYS win
      candidates.sort((a, b) => {
        const aHasSym = a.text.includes('₹') || a.text.includes('RS')
        const bHasSym = b.text.includes('₹') || b.text.includes('RS')

        // Final ultimate override: Symbol presence is the king
        if (aHasSym && !bHasSym) return -1
        if (!aHasSym && bHasSym) return 1

        return b.score - a.score || b.value - a.value
      })

      if (candidates.length > 0) {
        console.log('--- OCR Decision Engine v32 ---')
        candidates.slice(0, 5).forEach((c, idx) => {
          const hasSym = c.text.includes('₹') || c.text.includes('RS')
          console.log(`${idx + 1}. ₹${c.value} | Symbol: ${hasSym} | Score: ${c.score} | Context: "${c.line}"`)
        })
      }

      let extractedAmount = candidates.length > 0 ? candidates[0].value : null

      if (extractedAmount) {
        setFormData(prev => ({ ...prev, amount: extractedAmount }))
        toast.success(`Extracted: ₹${extractedAmount}`, { id: 'scan' })
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
                {isScanning ? 'Scanning Receipt...' : 'Scan Receipt / Screenshot (v32)'}
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
