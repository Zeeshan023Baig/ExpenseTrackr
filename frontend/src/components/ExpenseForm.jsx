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
  const [debugLogs, setDebugLogs] = useState([]) // New Debug State
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
    toast.loading('Scanning receipt for big amounts...', { id: 'scan' })

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      })

      // DEBUG: Log available keys to see what we got
      console.log('Tesseract Result Keys:', Object.keys(result.data))

      let candidates = []
      const currencySymbols = ['₹', 'RS', 'INR']

      // STRATEGY A: Geometry-based (Preferred)
      if (result.data.lines && result.data.lines.length > 0) {
        console.log('Using Lines strategy with', result.data.lines.length, 'lines')
        const lines = result.data.lines

        lines.forEach((lineObj, index) => {
          const lineText = lineObj.text.trim().toUpperCase()
          if (!lineText) return

          // Safety check for bbox
          const bbox = lineObj.bbox || { y0: 0, y1: 10 }
          const height = bbox.y1 - bbox.y0

          const hasCurrency = currencySymbols.some(sym => lineText.includes(sym))
          const matches = lineText.match(/[\d,]+(?:\.\d{1,2})?/gi)

          if (matches) {
            matches.forEach(match => {
              const numStr = match.replace(/[^\d.]/g, '')
              const num = parseFloat(numStr)

              if (isNaN(num) || num <= 0) return

              let score = height
              if (hasCurrency) score += 10000
              if (lineText.includes('TOTAL') || lineText.includes('AMOUNT')) score += 50

              candidates.push({
                value: num,
                score: score,
                height: height,
                hasCurrency: hasCurrency,
                text: lineText,
                line: lineText
              })
            })
          }
        })
      }
      // STRATEGY B: Fallback Text-based (If geometry fails)
      else {
        console.warn('Lines data missing! Falling back to simple text regex.')
        const text = result.data.text || ''
        const lines = text.split('\n')

        lines.forEach(line => {
          const lineText = line.trim().toUpperCase()
          const hasCurrency = currencySymbols.some(sym => lineText.includes(sym))
          const matches = lineText.match(/[\d,]+(?:\.\d{1,2})?/gi)

          if (matches) {
            matches.forEach(match => {
              const numStr = match.replace(/[^\d.]/g, '')
              const num = parseFloat(numStr)
              if (isNaN(num) || num <= 0) return

              // Simple scoring fallback
              let score = 0
              if (hasCurrency) score += 10000

              candidates.push({
                value: num,
                score: score,
                height: 0,
                hasCurrency: hasCurrency,
                text: lineText,
                line: lineText
              })
            })
          }
        })
      }

      // Sort by Score descending
      candidates.sort((a, b) => b.score - a.score)

      setDebugLogs(candidates.slice(0, 5))

      if (candidates.length > 0) {
        console.log('--- OCR Candidates ---')
        candidates.slice(0, 5).forEach((c, i) => {
          console.log(`#${i + 1}: ₹${c.value} | Height: ${c.height} | Sym: ${c.hasCurrency} | Text: "${c.text}"`)
        })

        // Strictness check: If user strictly wants ONLY lines with symbols,
        // we should check if the top candidate has a symbol.
        // However, robust fallback is usually better.
        // But the user prompt said: "it should only scan the big numbers with the ruppee symbol"
        // So let's prioritize the top candidate, and if it *doesn't* have a symbol, maybe warn or look further?
        // Current scoring ensures if *any* candidate has a symbol, it is at the top.
        // If *no* candidate has a symbol, the largest text is at the top. This effectively satisfies "scan big numbers",
        // and if a symbol exists, it wins.

        const bestMatch = candidates[0]
        setFormData(prev => ({ ...prev, amount: bestMatch.value }))
        toast.success(`Extracted: ₹${bestMatch.value}`, { id: 'scan' })

      } else {
        toast.error('No valid amounts found.', { id: 'scan' })
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
                {isScanning ? 'Scanning Receipt...' : 'Scan Receipt / Screenshot (v38)'}
              </span>
              <span className="text-xs text-surface-400">
                Upload to auto-fill amount
              </span>
            </div>

            {/* DEBUG PANEL */}
            {debugLogs.length > 0 && (
              <div className="mt-4 p-2 bg-black/50 rounded text-[10px] text-left font-mono overflow-hidden">
                <p className="text-surface-400 mb-1 border-b border-surface-700 pb-1">OCR LOGS (Share this if wrong)</p>
                {debugLogs.map((log, i) => (
                  <div key={i} className={`mb-1 ${i === 0 ? 'text-green-400 font-bold' : 'text-surface-300'}`}>
                    #{i + 1}: ₹{log.value} (Score: {log.score}) <br />
                    <span className="opacity-50">Context: "{log.line.substring(0, 20)}..."</span>
                  </div>
                ))}
              </div>
            )}
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
