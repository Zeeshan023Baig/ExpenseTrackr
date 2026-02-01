import { useContext, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiType, FiTag, FiUpload, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { FaRupeeSign, FaMagic } from 'react-icons/fa'
import { ExpenseContext } from '../context/ExpenseContext'
import api from '../services/api'

const ExpenseForm = ({ onSubmit, initialData = null, onCancel }) => {
  const { categories, addCategory } = useContext(ExpenseContext)
  const [isScanning, setIsScanning] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [formData, setFormData] = useState(
    initialData || {
      description: '',
      amount: '',
      category: 'Other',
      date: new Date().toISOString().split('T')[0]
    }
  )

  useEffect(() => {
    console.log('ExpenseForm v71 loaded - Gemini AI (Debug Mode)')
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

    setPreviewUrl(URL.createObjectURL(file))
    setIsScanning(true)
    const toastId = toast.loading('Gemini AI is analyzing...', { id: 'ai-scan' })

    try {
      const uploadData = new FormData()
      uploadData.append('image', file)

      const response = await api.post('/ocr/scan', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { amount, merchant, category, date } = response.data

      setFormData(prev => ({
        ...prev,
        amount: amount || prev.amount,
        // description: kept as is (user wants to type it)
        category: category && categories.includes(category) ? category : (category || prev.category),
        date: date || prev.date
      }))

      if (amount) {
        toast.success(`Found: ₹${amount} (${category})`, { id: 'ai-scan' })
      } else {
        toast.error('AI could not identify the amount.', { id: 'ai-scan' })
      }

    } catch (error) {
      console.error('AI Scan Exception:', error)
      const msg = error.response?.data?.message || error.message || 'Unknown Error'
      toast.error(`Scan Failed: ${msg}`, { id: 'ai-scan', duration: 5000 })
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
      setFormData({ description: '', amount: '', category: 'Other', date: new Date().toISOString().split('T')[0] })
      setPreviewUrl(null)
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
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 relative overflow-hidden ${isScanning ? 'border-purple-500 bg-purple-50' : 'border-surface-200 hover:border-purple-400 hover:bg-surface-50'
            }`}>

            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent w-full h-full animate-shimmer" />
            )}

            <div className="flex flex-col items-center gap-3 text-surface-500 group-hover:text-purple-600 relative z-10">
              {isScanning ? (
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <FaMagic size={28} className="text-purple-600" />
                </motion.div>
              ) : previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-md" />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <FiCheckCircle size={12} />
                  </div>
                </div>
              ) : (
                <FiUpload size={28} />
              )}

              <div className="flex flex-col">
                <span className="text-sm font-bold text-surface-700">
                  {isScanning ? 'Gemini AI is Watching...' : 'Upload Receipt / Screenshot'}
                </span>
                <span className="text-xs text-surface-400">
                  {isScanning ? 'Extracting info...' : 'Powered by Google Gemini AI'}
                </span>
              </div>
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
            placeholder="e.g., Payment to HDFC"
            className="input-field pl-4"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-surface-900 mb-2">
            Amount (₹)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">
              <FaRupeeSign />
            </div>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field pl-10"
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
