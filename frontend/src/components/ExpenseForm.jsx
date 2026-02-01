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

        // Mobile Status Bar + GPay Header can take up to 25% of the initial text lines
        const IS_DANGER_ZONE = i < 20
        const IS_CLOCK_LINE = line.includes(':') || line.includes('PM') || line.includes('AM')

        const matches = line.match(/(?:₹|RS|INR|RS.|S|Z|\?|\$|\!|3)?\s?([\d,]+(?:\.\d{1,2})?)/gi)

        if (matches) {
          matches.forEach(match => {
            const numStr = match.replace(/[^\d.]/g, '')
            const num = parseFloat(numStr)

            if (isNaN(num) || num <= 0 || num > 1000000) return

            // DETECTION: Currency symbols
            const hasExplicitCurrency = match.includes('₹') || match.includes('RS') || match.includes('INR')
            // Fuzzy: Sometimes ₹ is read as 'Z', 'S', '?', '!', or '3' when blurry
            const hasFuzzyCurrency = (match.includes('Z') || match.includes('S') || match.includes('?') || match.includes('!') || match.startsWith('3')) && numStr.length <= 6

            const isMarkedAsMoney = hasExplicitCurrency || hasFuzzyCurrency

            // AGGRESSIVE CLOCK BLOCKING
            // If it's a small number (<100) and in the top section or on a clock line, 
            // and it DOESN'T have a clear currency symbol, we kill it immediately.
            if ((IS_DANGER_ZONE || IS_CLOCK_LINE) && num < 100 && !hasExplicitCurrency) {
              return
            }

            // FILTER: Phone numbers, IDs (long numbers without decimals/symbols)
            if (numStr.length >= 7 && !numStr.includes('.') && !isMarkedAsMoney) return

            let score = 0

            // 1. SUCCESS ANCHORING: If the previous line or current line has "SUCCESSFUL" or "PAID"
            // This is the #1 signal in GPay/PhonePe
            const contextLines = lines.slice(Math.max(0, i - 2), i + 1).join(' ').toUpperCase()
            if (contextLines.includes('SUCCESSFUL') || contextLines.includes('PAID') || contextLines.includes('DONE')) {
              score += 500
            }

            // 2. KEYWORD SIGNALS
            if (highConfidenceKeywords.some(kw => line.includes(kw))) score += 200
            if (standardKeywords.some(kw => line.includes(kw))) score += 100

            // 3. SYMBOL PRIORITY (The "King" factor)
            if (hasExplicitCurrency) score += 2000 // Absurdly high to beat noise
            if (hasFuzzyCurrency) score += 300

            // 4. POSITION BOOST
            const linePosition = i / lines.length
            if (linePosition > 0.2 && linePosition < 0.7) score += 200 // Middle of screen boost

            // 5. PENALTIES
            if (IS_DANGER_ZONE && !isMarkedAsMoney) score -= 1000 // Kill clock/battery noise
            if (negativeKeywords.some(kw => line.includes(kw)) && !isMarkedAsMoney) score -= 500

            candidates.push({
              value: num,
              score,
              text: match,
              line: line,
              hasCurrency: isMarkedAsMoney,
              isExplicit: hasExplicitCurrency
            })
          })
        }
      }

      // Priority sort: EXPLICIT SYMBOLS > FUZZY SYMBOLS > SCORED NOISE
      candidates.sort((a, b) => {
        if (a.isExplicit && !b.isExplicit) return -1
        if (!a.isExplicit && b.isExplicit) return 1
        if (a.hasCurrency && !b.hasCurrency) return -1
        if (!a.hasCurrency && b.hasCurrency) return 1
        return b.score - a.score || b.value - a.value
      })

      if (candidates.length > 0) {
        console.log('--- OCR Engine (v34: GPay Specialist) ---')
        candidates.slice(0, 5).forEach((c, idx) => {
          console.log(`${idx + 1}. ₹${c.value} | Explicit: ${c.isExplicit} | Score: ${c.score} | Context: "${c.line}"`)
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
                {isScanning ? 'Scanning Receipt...' : 'Scan Receipt / Screenshot (v34)'}
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
