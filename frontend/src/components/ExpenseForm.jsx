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
    console.log('ExpenseForm v53 loaded - Upscale + Contrast')
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }))
  }

  // --- IMAGE PREPROCESSING (v53) ---
  // 1. Upscale 2x or 3x (Fixes Low DPI screenshots)
  // 2. High Contrast detection
  // 3. Grayscale + Invert
  const preprocessImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        // v53: UPSCALING
        // Standardize width to at least 2000px for good OCR
        const targetWidth = Math.max(img.width * 2, 2000)
        const scaleFactor = targetWidth / img.width
        const targetHeight = img.height * scaleFactor

        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight
        const ctx = canvas.getContext('2d')

        // Quality scaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data

        // Analyze brightness
        let totalBrightness = 0
        for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
        }
        const avgBrightness = totalBrightness / (data.length / 4)
        const isDarkMode = avgBrightness < 100

        console.log(`Image (v53): ${canvas.width}x${canvas.height} | Brightness: ${avgBrightness.toFixed(0)} | DarkMode: ${isDarkMode}`)

        // Contrast Factor (Simple geometric stretch)
        const contrast = 1.2 // Boost contrast by 20%
        const intercept = 128 * (1 - contrast)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Grayscale
          let gray = (r * 0.299 + g * 0.587 + b * 0.114) // Luminance formula

          // Invert if Dark Mode
          if (isDarkMode) gray = 255 - gray

          // Apply Contrast
          gray = gray * contrast + intercept
          gray = Math.min(255, Math.max(0, gray)) // Clamp

          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        }

        ctx.putImageData(imgData, 0, 0)

        canvas.toBlob((blob) => {
          blob.width = canvas.width
          blob.height = canvas.height
          resolve(blob)
        }, 'image/png')
      }
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsScanning(true)
    toast.loading('Enhancing & Scanning... (v53)', { id: 'scan' })
    setDebugRaw('')
    setDebugLogs([])

    try {
      const optimizedBlob = await preprocessImage(file)
      const imgHeight = optimizedBlob.height

      const worker = await Tesseract.createWorker("eng", 1, {
        logger: m => console.log(m),
      });

      await worker.setParameters({
        tessedit_pageseg_mode: '6', // Single block is robust
        tessedit_char_whitelist: '0123456789.,₹RsINR:APM-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      });

      const result = await worker.recognize(optimizedBlob);
      await worker.terminate();

      setDebugRaw(result.data.text)
      console.log('--- RAW TEXT ---', result.data.text)

      const getAllLines = (data) => {
        if (data.lines && data.lines.length > 0) return data.lines
        if (data.blocks && data.blocks.length > 0) {
          return data.blocks.flatMap(block => {
            if (block.lines && block.lines.length > 0) return block.lines
            return []
          })
        }
        return data.text ? data.text.split('\n').map(t => ({ text: t, bbox: { y0: 0 } })) : []
      }

      const lines = getAllLines(result.data)
      lines.sort((a, b) => (a.bbox?.y0 || 0) - (b.bbox?.y0 || 0))

      let candidates = []
      const currencySymbols = ['₹', 'RS', 'INR']

      lines.forEach((lineObj, index) => {
        const lineText = lineObj.text.trim().toUpperCase()
        if (!lineText) return

        const prevLine = index > 0 ? lines[index - 1].text.toUpperCase() : ''

        // geometry
        const bbox = lineObj.bbox || { y0: 0, y1: 0 }
        const height = bbox.y1 - bbox.y0
        const hasGeometry = height > 0
        const relativeY = bbox.y0 / imgHeight

        const matches = lineText.match(/[\d,]+(?:\.\d{1,2})?/gi)

        if (matches) {
          matches.forEach(match => {
            const numStr = match.replace(/[^\d.]/g, '')
            const num = parseFloat(numStr)

            if (isNaN(num) || num <= 0) return

            const hasExplicit = currencySymbols.some(sym => lineText.includes(sym))
            const isFuzzy = /^[?Z$FT7]\s?\d/.test(lineText)

            let score = 0

            // 1. Height
            if (hasGeometry) score += height
            else if (lineText.length < 8) score += 50

            // 2. Currency
            if (hasExplicit) score += 10000
            else if (isFuzzy) score += 1000

            // 3. GEOMETRIC SCORING (v52 Center Bias)
            if (hasGeometry) {
              // Status Bar (Top 10%) - Kill
              if (relativeY < 0.1) score -= 5000

              // Bottom Details (Bottom 40%) - Penalty
              if (relativeY > 0.6) score -= 2000

              // Center Helper (20% to 50%) - Boost heavily
              if (relativeY > 0.15 && relativeY < 0.5) score += 8000
            }

            // 4. Filters & Penalties
            const bankingKeywords = ['BANK', 'HDFC', 'SBI', 'ICICI', 'PAYTM', 'GPAY', 'GOOGLE', 'WALLET', 'PAY']
            if (bankingKeywords.some(bk => lineText.includes(bk)) && !hasExplicit) score -= 10000

            if (lineText.includes('+91') && !hasExplicit) score -= 5000

            if (numStr.split('.')[0].length > 7) score -= 10000

            // Year check (2026 -> 2026)
            if (num > 1900 && num < 2100 && !hasExplicit && !hasFuzzy) score -= 500

            const negs = ['ID', 'REF', 'NO', 'TIME', 'DATE', 'UPI']
            if (negs.some(bad => lineText.includes(bad)) && !hasExplicit) score -= 5000
            if (negs.some(bad => prevLine.includes(bad)) && !hasExplicit) score -= 5000

            if (lineText.includes(':') && !hasExplicit) score -= 5000

            // If "497" is persistently appearing, it might be noise.
            // Explicit filter for this specific number if it's a known artifact, but better to solve generally.

            candidates.push({
              value: num,
              score: score,
              text: lineText,
              height,
              pos: relativeY.toFixed(2)
            })
          })
        }
      })

      candidates.sort((a, b) => b.score - a.score)
      const validCandidates = candidates.filter(c => c.score > -500)
      setDebugLogs(candidates.slice(0, 5))

      if (validCandidates.length > 0) {
        // Tie breaker
        const topScore = validCandidates[0].score
        const topTier = validCandidates.filter(c => c.score >= topScore - 100)
        topTier.sort((a, b) => a.text.length - b.text.length)

        const best = topTier[0]
        setFormData(prev => ({ ...prev, amount: best.value }))
        toast.success(`Extracted: ₹${best.value}`, { id: 'scan' })
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
                {isScanning ? 'Scanning... (v53)' : 'Scan Receipt / Screenshot'}
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
                    #{i + 1}: ₹{log.value} (Sc: {log.score} | Y: {log.pos}) <br />
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
