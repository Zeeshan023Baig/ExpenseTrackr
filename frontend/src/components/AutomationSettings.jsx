import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCpu, FiCopy, FiRefreshCcw, FiCheckCircle, FiInfo } from 'react-icons/fi'
import { smsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const AutomationSettings = () => {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerateToken = async () => {
    setLoading(true)
    try {
      await smsAPI.generateToken()
      await refreshUser()
      toast.success('Webhook token generated! 🚀')
    } catch (error) {
      toast.error('Failed to generate token')
    } finally {
      setLoading(false)
    }
  }

  const webhookUrl = user?.webhookToken 
    ? `${window.location.origin.replace('3000', '5000')}/api/sms/webhook/${user.webhookToken}`
    : 'No token generated yet'

  const copyToClipboard = () => {
    if (!user?.webhookToken) return
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    toast.success('URL copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 border-l-4 border-l-purple-500 overflow-hidden relative"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <FiCpu size={20} />
            </div>
            <h3 className="text-xl font-bold text-surface-900">SMS Automation</h3>
          </div>
          
          <p className="text-surface-600 text-sm max-w-2xl">
            Automatically add expenses by forwarding bank SMS messages from your Android phone. 
            Use your unique Webhook URL in your SMS forwarder app.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-400 uppercase tracking-wider">Your Webhook URL</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 rounded-xl p-3 font-mono text-xs text-surface-700 dark:text-surface-300 break-all">
                {webhookUrl}
              </div>
              <button
                onClick={copyToClipboard}
                disabled={!user?.webhookToken}
                className={`p-3 rounded-xl border transition-all ${
                  copied 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 hover:bg-surface-50'
                } disabled:opacity-30`}
              >
                {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleGenerateToken}
              disabled={loading}
              className="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 text-sm px-4 py-2 shadow-lg shadow-purple-500/20 transition-all"
            >
              <FiRefreshCcw className={loading ? 'animate-spin' : ''} />
              {user?.webhookToken ? 'Reset Token' : 'Generate Token'}
            </button>
            
            <div className="flex items-center gap-2 text-xs text-surface-400 bg-surface-50 dark:bg-surface-800/50 px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700">
              <FiInfo className="text-purple-500" />
              <span>Configure your APK to POST to this URL with <code>{"{ \"text\": \"...\" }"}</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <FiCpu size={160} />
      </div>
    </motion.div>
  )
}

export default AutomationSettings
