import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

const ICONS = { success: Check, info: Info, error: AlertTriangle }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback((message, type = 'success') => {
    const id = ++idRef.current
    setToasts((t) => [...t.slice(-2), { id, message, type }])
    setTimeout(() => dismiss(id), 3400)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toaster" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Check
            return (
              <motion.div
                key={t.id}
                className={`toast toast--${t.type}`}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => dismiss(t.id)}
              >
                <span className="toast__icon"><Icon size={14} strokeWidth={2.4} /></span>
                <span>{t.message}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
