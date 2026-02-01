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

        // Mobile Status Bar usually occupies the top 10-15% of the screen
        const IS_VERY_TOP = i < 8
        const IS_HEADER_AREA = i < 15

        // CRITICAL: Better clock detection (14:42, 14 42, 2.45 PM)
        const HAS_CLOCK_SYMBOL = line.includes(':') || line.includes('PM') || line.includes('AM')
        // Match patterns like "10:20" or "10 20" or "10.20 PM"
        const IS_CLOCK_PATTERN = line.match(/\b\d{1,2}[:.\s]\d{2}\b/)

        const matches = line.match(/(?:₹|RS|INR|RS.|S|Z|\?|\$)?[^\d]?\s?([\d,]+(?:\.\d{1,2})?)/gi)

        if (matches) {
          matches.forEach(match => {
            const numStr = match.replace(/[^\d.]/g, '')
            const num = parseFloat(numStr)

            if (isNaN(num) || num <= 0 || num > 1000000) return

            // DETECTION: Currency symbols (Explicit vs Fuzzy)
            const hasExplicitCurrency = match.includes('₹') || match.includes('RS') || match.includes('INR') || match.includes('$')
            // Fuzzy: Sometimes ₹ is read as 'S', 'Z', '?', or even '3' when blurry
            const hasFuzzyCurrency = (match.includes('S') || match.includes('Z') || match.includes('?')) && numStr.length <= 6

            const isMarkedAsMoney = hasExplicitCurrency || hasFuzzyCurrency

            // AGGRESSIVE CLOCK/STATUS NOISE TRAP
            // 1. If it's a small number on a line that looks like a clock, it's noise.
            if ((HAS_CLOCK_SYMBOL || IS_CLOCK_PATTERN) && num < 100 && !hasExplicitCurrency) return

            // 2. If it's at the very top (status bar) and < 100, it's almost certainly the clock or battery.
            if (IS_VERY_TOP && num < 100 && !hasExplicitCurrency) return

            // 3. If it's in the header area and < 60, ignore unless it has a clear symbol.
            if (IS_HEADER_AREA && num < 60 && !isMarkedAsMoney) return

            // FILTER: Phone numbers, IDs (long numbers without decimals/symbols)
            if (numStr.length >= 7 && !numStr.includes('.') && !isMarkedAsMoney) return

            let score = 0

            // SCORING: Proximity to success keywords (GPay / PhonePe)
            if (highConfidenceKeywords.some(kw => line.includes(kw))) score += 150
            if (line.includes('SUCCESSFUL') || line.includes('DONE') || line.includes('PAID')) score += 100
            if (standardKeywords.some(kw => line.includes(kw))) score += 50

            // SCORING: Symbol Priority
            if (hasExplicitCurrency) score += 700
            if (hasFuzzyCurrency) score += 150

            // SCORING: Center Image Boost (Amount is usually in the middle)
            // If the line is roughly in the middle 60% of the image
            const linePosition = i / lines.length
            if (linePosition > 0.2 && linePosition < 0.8) {
              score += 100
            }

            // PENALTY: Header/Footer noise
            if (IS_HEADER_AREA && !isMarkedAsMoney) score -= 400
            if (negativeKeywords.some(kw => line.includes(kw)) && !isMarkedAsMoney) score -= 300

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

      // Priority sort: Candidates with EXPLICIT symbols (₹) rank first
      candidates.sort((a, b) => {
        if (a.isExplicit && !b.isExplicit) return -1
        if (!a.isExplicit && b.isExplicit) return 1
        return b.score - a.score || b.value - a.value
      })

      if (candidates.length > 0) {
        console.log('--- OCR Decision Engine v33 ---')
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
                {isScanning ? 'Scanning Receipt...' : 'Scan Receipt / Screenshot (v33)'}
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
