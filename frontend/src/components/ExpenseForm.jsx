import { useContext, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiType, FiTag, FiUpload, FiLoader } from 'react-icons/fi'
import { FaRupeeSign } from 'react-icons/fa'
import { ExpenseContext } from '../context/ExpenseContext'
import Tesseract from 'tesseract.js'

const ExpenseForm = ({ onSubmit, initialData = null, onCancel }) => {
  const { categories, addCategory } = useContext(ExpenseContext)
  const [isScanning, setIsScanning] = useState(false)
  const [debugLogs, setDebugLogs] = useState([])
  const [formData, setFormData] = useState(
    initialData || {
      description: '',
      amount: '',
      category: 'Other'
    }
  )

  useEffect(() => {
    console.log('ExpenseForm v46 loaded - OCR Fix Active')
  }, [])

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
    toast.loading('Scanning... (v46: ID Filter)', { id: 'scan' })

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      })

      // START ROBUST EXTRACTOR
      const getAllLines = (data) => {
        if (data.lines && data.lines.length > 0) return data.lines
        if (data.blocks && data.blocks.length > 0) {
          return data.blocks.flatMap(block => {
            if (block.lines && block.lines.length > 0) return block.lines
            if (block.paragraphs && block.paragraphs.length > 0) {
              return block.paragraphs.flatMap(p => p.lines || [])
            }
            return []
          })
        }
        if (data.text) {
          console.warn('No geometry lines found! Creating synthetic lines from text.')
          return data.text.split('\n').map(txt => ({
            text: txt,
            bbox: { y0: 0, y1: 0 }
          }))
        }
        return []
      }

      const lines = getAllLines(result.data)
      // SORT BY VERTICAL POSITION (Critical for Layout Analysis)
      lines.sort((a, b) => (a.bbox?.y0 || 0) - (b.bbox?.y0 || 0))

      console.log(`Scan complete. Found ${lines.length} lines.`)

      let candidates = []

      // Keywords
      const currencySymbols = ['₹', 'RS', 'INR']
      const fuzzyMarkers = ['?', 'Z', 'S', '$', 'F', 'T', '7']

      lines.forEach((lineObj, index) => {
        const lineText = lineObj.text.trim().toUpperCase()
        if (!lineText) return

        // Context Lookbehind
        const prevLine = index > 0 ? lines[index - 1].text.toUpperCase() : ''

        // 1. Calculate Line Height
        const bbox = lineObj.bbox || { y0: 0, y1: 0 }
        const height = bbox.y1 - bbox.y0
        const hasGeometry = height > 0

        // 2. Extract Numbers
        const matches = lineText.match(/[\d,]+(?:\.\d{1,2})?/gi)

        if (matches) {
          matches.forEach(match => {
            const numStr = match.replace(/[^\d.]/g, '')
            const num = parseFloat(numStr)

            if (isNaN(num) || num <= 0) return

            // 3. Analyze Currency Presence
            const hasExplicit = currencySymbols.some(sym => lineText.includes(sym))
            const hasFuzzy = fuzzyMarkers.some(m => lineText.includes(m) && lineText.length < 15)

            // 4. Scoring Logic
            let score = 0

            // Height score
            if (hasGeometry) {
              score += height
            } else {
              if (lineText.length < 10) score += 20
            }

            // Currency bonanza
            if (hasExplicit) {
              score += 10000
            } else if (hasFuzzy) {
              score += 1000
            }

            // Keyword Context
            if (lineText.includes('TOTAL') || lineText.includes('AMOUNT') || lineText.includes('PAYABLE')) {
              score += 2000
            }

            // --- FILTERS ---

            // 1. Long Numbers (ID Killer)
            const integerPart = numStr.split('.')[0]
            if (integerPart.length > 7) {
              score -= 10000
            }

            // 2. Negative Keywords (Current Line)
            const negativeContext = ['ID', 'REF', 'NO', 'TIME', 'DATE', 'PHONE', 'MOBILE', 'BATTERY', 'SIGNAL', 'UPI']
            if (negativeContext.some(bad => lineText.includes(bad))) {
              if (!hasExplicit) score -= 5000
            }

            // 3. Negative Context (Previous Line) - Looking for "Transaction ID" label above value
            if (['ID', 'REF', 'UPI', 'NO', 'TRANSACTION'].some(bad => prevLine.includes(bad))) {
              if (!hasExplicit) score -= 5000
            }

            // 4. Penalize likely dates/times
            if (lineText.includes(':') || lineText.includes('AM') || lineText.includes('PM')) {
              if (!hasExplicit) score -= 5000
            }
            if (num > 1900 && num < 2100 && !hasExplicit && !hasFuzzy) {
              score -= 500
            }

            candidates.push({
              value: num,
              score: score,
              height: height,
              type: hasExplicit ? 'EXPLICIT' : (hasFuzzy ? 'FUZZY' : 'NONE'),
              text: lineText,
              line: lineText,
              prev: prevLine.substring(0, 10)
            })
          })
        }
      })

      // Sort by Score descending
      candidates.sort((a, b) => b.score - a.score)

      // Filter garbage (e.g. penalized IDs)
      const validCandidates = candidates.filter(c => c.score > -1000)

      setDebugLogs(candidates.slice(0, 5)) // Show even bad ones in debug

      if (validCandidates.length > 0) {
        console.log('--- OCR Candidates (v46) ---')
        validCandidates.slice(0, 5).forEach((c, i) => {
          console.log(`#${i + 1}: ₹${c.value} | Sc: ${c.score} | Ht: ${c.height} | Prev: "${c.prev}"`)
        })

        const bestMatch = validCandidates[0]
        setFormData(prev => ({ ...prev, amount: bestMatch.value }))
        toast.success(`Extracted: ₹${bestMatch.value}`, { id: 'scan' })

      } else {
        toast.error('No valid amount found (filtered IDs)', { id: 'scan' })
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
                {isScanning ? 'Scanning... (v46)' : 'Scan Receipt / Screenshot'}
              </span>
              <span className="text-xs text-surface-400">
                Upload to auto-fill amount
              </span>
            </div>

            {/* DEBUG PANEL */}
            {debugLogs.length > 0 && (
              <div className="mt-4 p-2 bg-black/50 rounded text-[10px] text-left font-mono overflow-hidden">
                <p className="text-surface-400 mb-1 border-b border-surface-700 pb-1">OCR LOGS (Share if wrong)</p>
                {debugLogs.map((log, i) => (
                  <div key={i} className={`mb-1 ${i === 0 ? 'text-green-400 font-bold' : log.score < 0 ? 'text-red-400' : 'text-surface-300'}`}>
                    #{i + 1}: ₹{log.value} (Sc: {log.score}) <br />
                    <span className="opacity-50">Line: "{log.text.substring(0, 15)}..."</span>
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
