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
    console.log('ExpenseForm v56 loaded - Padding + PSM 11')
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }))
  }

  // --- IMAGE PREPROCESSING (v56 - PADDING + CROP) ---
  const preprocessImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        // v56: Reduced upscaling to 1.5x to be safer/faster
        const targetWidth = Math.max(img.width * 1.5, 1500)
        const scaleFactor = targetWidth / img.width
        const targetHeight = img.height * scaleFactor

        const canvas = document.createElement('canvas')

        const CROP_TOP = 0.15
        const CROP_BOTTOM = 0.60
        const cropHeightPercent = CROP_BOTTOM - CROP_TOP
        const cropHeight = targetHeight * cropHeightPercent

        // PADDING: Add 50px white padding around the crop
        const PADDING = 50
        canvas.width = targetWidth + (PADDING * 2)
        canvas.height = cropHeight + (PADDING * 2)

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#FFFFFF' // White background for padding
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw centered in padding
        ctx.drawImage(
          img,
          0, img.height * CROP_TOP, img.width, img.height * cropHeightPercent,
          PADDING, PADDING, targetWidth, cropHeight
        )

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data

        // Brightness on Valid Area (skipping padding for calc)
        // We sample only the center to guess mode correctly
        let totalBrightness = 0
        let pixelCount = 0
        const sampleStart = (PADDING * canvas.width * 4) // Start after top padding roughly
        const sampleEnd = data.length - (PADDING * canvas.width * 4)

        for (let i = sampleStart; i < sampleEnd; i += 16) { // step 16 optimization
          if (data[i + 3] > 0) { // Check alpha
            totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
            pixelCount++
          }
        }
        const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 128
        const isDarkMode = avgBrightness < 100

        console.log(`Image (v56): Padded | DarkMode: ${isDarkMode}`)

        // Grayscale + Invert
        // Note: We don't want to invert the PADDING (White).
        // The Padding is already White (255,255,255).
        // If DarkMode is true, we want BG to become White.
        // So we only invert if the pixel was part of the original image...
        // Actually, easiest is to ensure logic maps "Dark BG" -> "White".
        // Padding is White. So Padding stays White.

        for (let i = 0; i < data.length; i += 4) {
          // If this is PADDING (White), keep it White.
          // Heuristic: If we just drew white, it's white.
          // But simpler: just apply the transform.

          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]

          let gray = (r * 0.299 + g * 0.587 + b * 0.114)

          if (isDarkMode) {
            // Invert: Black(0) -> White(255). White(255) -> Black(0).
            // BUT! The Padding is White (255). It would become Black (0).
            // We DON'T want a black border.
            // So we must handle padding separately or just fill padding with Black if DarkMode?
            // No, Tesseract wants White background.
            // So, if DarkMode: we Invert the Image Content, but keep Padding White.
            // Since we processed the whole canvas, the Padding (255) became (0).
            // We can just clobber the padding again at the end, or cleaner:
            gray = 255 - gray
          }

          // Contrast (Gentle)
          // gray = ((gray - 128) * 1.1) + 128

          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
          data[i + 3] = 255 // Alpha opaque
        }

        ctx.putImageData(imgData, 0, 0)

        // Re-paint white padding if we inverted it to black
        if (isDarkMode) {
          ctx.fillStyle = '#FFFFFF'
          // Top
          ctx.fillRect(0, 0, canvas.width, PADDING)
          // Bottom
          ctx.fillRect(0, canvas.height - PADDING, canvas.width, PADDING)
          // Left
          ctx.fillRect(0, 0, PADDING, canvas.height)
          // Right
          ctx.fillRect(canvas.width - PADDING, 0, PADDING, canvas.height)
        }

        canvas.toBlob((blob) => {
          blob.isDarkMode = isDarkMode // Attach metadata for debug
          resolve(blob)
        }, 'image/png')
      }
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsScanning(true)
    toast.loading('Scanning (v56: PSM 11)...', { id: 'scan' })
    setDebugRaw('')
    setDebugLogs([])

    try {
      const optimizedBlob = await preprocessImage(file)

      const worker = await Tesseract.createWorker("eng", 1, {
        logger: m => console.log(m),
      });

      // PSM 11: Sparse Text. Great for receipts/invoices. 
      // Adds segmentation robustness over PSM 6.
      await worker.setParameters({
        tessedit_pageseg_mode: '11',
        tessedit_char_whitelist: '0123456789.,₹RsINR:APM-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      });

      const result = await worker.recognize(optimizedBlob);
      await worker.terminate();

      setDebugRaw(`[Mode: ${optimizedBlob.isDarkMode ? 'Dark' : 'Light'}]\n` + result.data.text)
      console.log('--- RAW TEXT ---', result.data.text)

      const getAllLines = (data) => {
        if (data.lines && data.lines.length > 0) return data.lines
        // PSM 11 might populate different structures
        if (data.blocks && data.blocks.length > 0) {
          return data.blocks.flatMap(block => {
            if (block.lines && block.lines.length > 0) return block.lines
            return []
          })
        }
        // If still empty, use words?
        if (data.words && data.words.length > 0) {
          // Synthesize line-like objects from words
          return data.words; // Treat words as lines primarily for height check
        }

        return data.text ? data.text.split('\n').map(t => ({ text: t, bbox: { y0: 0 } })) : []
      }

      let lines = getAllLines(result.data)

      // Filter empty
      lines = lines.filter(l => l.text && l.text.trim().length > 0)

      let candidates = []
      const currencySymbols = ['₹', 'RS', 'INR']

      // 1. FIRST PASS: Find Max Height
      let maxHeight = 0;
      let hasGeom = false

      lines.forEach(line => {
        const bbox = line.bbox || { y0: 0, y1: 0 }
        const h = bbox.y1 - bbox.y0
        if (h > 0) {
          if (h > maxHeight) maxHeight = h
          hasGeom = true
        }
      })
      console.log('Max Height Found:', maxHeight, 'Has Geometry:', hasGeom)

      lines.forEach((lineObj, index) => {
        const lineText = lineObj.text.trim().toUpperCase()
        if (!lineText) return

        const bbox = lineObj.bbox || { y0: 0, y1: 0 }
        const height = bbox.y1 - bbox.y0
        const hasGeometry = height > 0

        const matches = lineText.match(/[\d,]+(?:\.\d{1,2})?/gi)

        if (matches) {
          matches.forEach(match => {
            const numStr = match.replace(/[^\d.]/g, '')
            const num = parseFloat(numStr)

            if (isNaN(num) || num <= 0) return

            const hasExplicit = currencySymbols.some(sym => lineText.includes(sym))
            const isFuzzy = /^[?Z$FT7]\s?\d/.test(lineText)

            let score = 0

            // 1. Height Supremacy
            if (hasGeometry && maxHeight > 5) {
              // If it's big, it's the winner.
              if (height > maxHeight * 0.8) score += 10000
              else if (height > maxHeight * 0.5) score += 2000
              else {
                // It is SMALL.
                // If we found a MaxHeight (Amount), and this is tiny, it's likely noise (Date, ID, Phone).
                // KILL IT.
                score -= 5000
              }
            } else {
              // Fallback if no geometry (should not happen with PSM 11 + Padding)
              if (lineText.length < 8) score += 50
            }

            // 2. Currency
            if (hasExplicit) score += 5000
            else if (isFuzzy) score += 1000

            // 3. Filters
            const bankingKeywords = ['BANK', 'HDFC', 'SBI', 'ICICI', 'PAYTM', 'GPAY', 'GOOGLE', 'WALLET', 'PAY']
            if (bankingKeywords.some(bk => lineText.includes(bk)) && !hasExplicit) score -= 10000

            // HARD KILL: '91'
            if (num === 91) score -= 20000
            if (lineText.includes('+91') && !hasExplicit) score -= 5000

            if (numStr.split('.')[0].length > 7) score -= 10000

            // Year check (Only if text is small. Big 2000 is likely an amount)
            if (num > 1900 && num < 2100 && !hasExplicit && !hasFuzzy && height < maxHeight * 0.5) score -= 500

            // Negative words
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

        // Final sanity check: If the winner is '1' and score is 0, ignore it.
        const best = validCandidates[0]
        if (best.value === 1 && best.score <= 0) {
          toast.error('Scanning ambiguous. Please type amount.', { id: 'scan' })
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
                {isScanning ? 'Scanning... (v56)' : 'Scan Receipt / Screenshot'}
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
