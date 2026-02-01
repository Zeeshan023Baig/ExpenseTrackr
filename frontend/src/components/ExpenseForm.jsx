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
  const [debugRaw, setDebugRaw] = useState('')
  const [formData, setFormData] = useState(
    initialData || {
      description: '',
      amount: '',
      category: 'Other'
    }
  )

  useEffect(() => {
    console.log('ExpenseForm v58 loaded - Pattern Correction')
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }))
  }

  // --- IMAGE PREPROCESSING (v57 Base) ---
  const preprocessImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const targetWidth = Math.max(img.width * 1.5, 1500)
        const scaleFactor = targetWidth / img.width
        const targetHeight = img.height * scaleFactor

        const canvas = document.createElement('canvas')
        const CROP_TOP = 0.12
        const CROP_BOTTOM = 0.65
        const cropHeightPercent = CROP_BOTTOM - CROP_TOP

        canvas.width = targetWidth
        canvas.height = targetHeight * cropHeightPercent

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(
          img,
          0, img.height * CROP_TOP, img.width, img.height * cropHeightPercent,
          0, 0, canvas.width, canvas.height
        )

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data

        let totalBrightness = 0
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
        }
        const avgBrightness = totalBrightness / (data.length / 4)
        const isDarkMode = avgBrightness < 100

        console.log(`Image (v58): Cropped | DarkMode: ${isDarkMode}`)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          let gray = (r * 0.299 + g * 0.587 + b * 0.114)
          if (isDarkMode) gray = 255 - gray

          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        }

        ctx.putImageData(imgData, 0, 0)

        canvas.toBlob((blob) => {
          blob.isDarkMode = isDarkMode
          resolve(blob)
        }, 'image/png')
      }
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsScanning(true)
    toast.loading('Analyzing numbers... (v58)', { id: 'scan' })
    setDebugRaw('')
    setDebugLogs([])

    try {
      const optimizedBlob = await preprocessImage(file)

      const worker = await Tesseract.createWorker("eng", 1, {
        logger: m => console.log(m),
      });

      await worker.setParameters({
        tessedit_pageseg_mode: '11',
        tessedit_char_whitelist: '0123456789.,₹RsINR:APM-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      });

      const result = await worker.recognize(optimizedBlob);
      await worker.terminate();

      setDebugRaw(`[Mode: ${optimizedBlob.isDarkMode ? 'Dark' : 'Light'}]\n` + result.data.text)
      console.log('--- RAW TEXT ---', result.data.text)

      // LINE SYNTHESIS (Robust)
      const words = result.data.words || []
      const manualLines = []
      words.sort((a, b) => {
        const ay = a.bbox.y0
        const by = b.bbox.y0
        if (Math.abs(ay - by) < 10) return a.bbox.x0 - b.bbox.x0
        return ay - by
      })

      words.forEach(word => {
        const wordMidY = (word.bbox.y0 + word.bbox.y1) / 2
        const matchingLine = manualLines.find(line => {
          const lineHeight = line.bbox.y1 - line.bbox.y0
          const lineMidY = (line.bbox.y0 + line.bbox.y1) / 2
          return Math.abs(wordMidY - lineMidY) < (lineHeight * 0.6) // 60% overlap
        })
        if (matchingLine) {
          matchingLine.text += ' ' + word.text
          matchingLine.bbox.x1 = Math.max(matchingLine.bbox.x1, word.bbox.x1)
          matchingLine.bbox.y0 = Math.min(matchingLine.bbox.y0, word.bbox.y0)
          matchingLine.bbox.y1 = Math.max(matchingLine.bbox.y1, word.bbox.y1)
        } else {
          manualLines.push({ text: word.text, bbox: { ...word.bbox } })
        }
      })

      const lines = manualLines

      let candidates = []
      const currencySymbols = ['₹', 'RS', 'INR']

      // 1. Max Height Calc
      let maxHeight = 0;
      lines.forEach(line => {
        const h = (line.bbox.y1 - line.bbox.y0)
        if (h > maxHeight) maxHeight = h
      })
      console.log('Max Height:', maxHeight)

      lines.forEach((lineObj, index) => {
        let lineText = lineObj.text.trim().toUpperCase()
        if (!lineText) return

        // --- v58 PATTERN CORRECTION ---
        // 1. Remove Spaces in apparent numbers: "1 000" -> "1000"
        // But be careful not to merge "12 Jan" -> "12Jan".
        // Heuristic: If line contains mostly digits/symbols, strip spaces.
        const digitCount = (lineText.match(/\d/g) || []).length
        const totalCount = lineText.length
        if (digitCount / totalCount > 0.5) {
          // It's mostly numbers. Safe to strip spaces.
          lineText = lineText.replace(/\s+/g, '')
        }

        // 2. Fix common currency typos at start
        // "31000" where "3" is "₹"
        // "7500" where "7" is "₹"
        // "?500" where "?" is "₹"
        // Only apply if we have geometry and it's BIG (Amount)
        const bbox = lineObj.bbox
        const height = bbox.y1 - bbox.y0
        const isBig = height > maxHeight * 0.5

        if (isBig) {
          // Check for zombie prefixes
          if (/^[?73Z]\d+/.test(lineText)) {
            // Heuristic: "31000" -> "₹1000" is VERY risky.
            // But "?1000" -> "₹1000" is safe.
            // "71000" -> ?? "7" is often read for "₹".
            // Let's replace '?' and 'Z' safely.
            lineText = lineText.replace(/^[?Z]/, '₹')
          }
        }
        // -----------------------------

        const hasGeometry = height > 0

        const matches = lineText.match(/[\d,]+(?:\.\d{1,2})?/gi)

        if (matches) {
          matches.forEach(match => {
            const numStr = match.replace(/[^\d.]/g, '')
            const num = parseFloat(numStr)

            if (isNaN(num) || num <= 0) return

            const hasExplicit = currencySymbols.some(sym => lineText.includes(sym))
            const isFuzzy = /^[?Z$FT7]\s?\d/.test(lineText) || lineText.startsWith('₹')

            let score = 0

            // 1. Height Supremacy
            if (hasGeometry && maxHeight > 5) {
              if (height > maxHeight * 0.8) score += 10000
              else if (height > maxHeight * 0.5) score += 2000
              else score -= 5000
            }

            // 2. Currency
            if (hasExplicit) score += 5000
            else if (isFuzzy) score += 1000

            // 3. Filters
            const bankingKeywords = ['BANK', 'HDFC', 'SBI', 'ICICI', 'PAYTM', 'GPAY', 'GOOGLE', 'WALLET', 'PAY']
            if (bankingKeywords.some(bk => lineText.includes(bk)) && !hasExplicit) score -= 10000

            if (num === 91 || num === 4 || num === 5) score -= 20000
            if (lineText.includes('+91') && !hasExplicit) score -= 5000

            if (numStr.split('.')[0].length > 7) score -= 10000

            // Year check
            if (num > 1900 && num < 2100 && !hasExplicit && !hasFuzzy) {
              if (height < maxHeight * 0.8) score -= 500
            }

            const negs = ['ID', 'REF', 'NO', 'TIME', 'DATE', 'UPI']
            if (negs.some(bad => lineText.includes(bad)) && !hasExplicit) score -= 5000

            candidates.push({ value: num, score: score, text: lineText, height })
          })
        }
      })

      candidates.sort((a, b) => b.score - a.score)
      const validCandidates = candidates.filter(c => c.score > -1000)
      setDebugLogs(candidates.slice(0, 5))

      if (validCandidates.length > 0) {

        const best = validCandidates[0]
        if (best.value < 10 && best.score <= 0) {
          toast.error('Could not clearly read amount.', { id: 'scan' })
        } else {
          setFormData(prev => ({ ...prev, amount: best.value }))
          toast.success(`Extracted: ₹${best.value}`, { id: 'scan' })
        }

      } else {
        toast.error('No valid amount found.', { id: 'scan' })
      }

    } catch (error) {
      console.error(error)
      toast.error('Scan failed', { id: 'scan' })
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
                {isScanning ? 'Scanning... (v58)' : 'Scan Receipt / Screenshot'}
              </span>
              <span className="text-xs text-surface-400">
                Upload to auto-fill amount
              </span>
            </div>

            {debugLogs.length > 0 && (
              <div className="mt-4 p-2 bg-black/50 rounded text-[10px] text-left font-mono overflow-hidden">
                <p className="text-surface-400 mb-1 border-b border-surface-700 pb-1">OCR LOGS (Share if wrong)</p>
                {debugLogs.map((log, i) => (
                  <div key={i} className={`mb-1 ${i === 0 ? 'text-green-400 font-bold' : log.score < 0 ? 'text-red-400' : 'text-surface-300'}`}>
                    #{i + 1}: ₹{log.value} (Sc: {log.score} | H: {log.height ? log.height.toFixed(0) : 'NaN'}) <br />
                    <span className="opacity-50">"{log.text.substring(0, 15)}..."</span>
                  </div>
                ))}
              </div>
            )}

            {debugRaw && (
              <div className="mt-2 p-2 bg-gray-900 rounded text-[10px] text-left font-mono max-h-20 overflow-y-auto">
                <p className="text-blue-400 border-b border-blue-900 pb-1 mb-1">RAW TEXT:</p>
                <pre className="whitespace-pre-wrap text-gray-400">{debugRaw}</pre>
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
