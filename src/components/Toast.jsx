import { useState, useEffect, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

const ToastIcon = ({ type }) => {
  switch (type) {
    case 'success': return <CheckCircle className="text-green-500" size={20} />
    case 'error': return <AlertCircle className="text-red-500" size={20} />
    case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />
    default: return <Info className="text-blue-500" size={20} />
  }
}

const ToastItem = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), type === 'error' ? 5000 : 3000)
    return () => clearTimeout(timer)
  }, [id, type, onClose])

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  }

  return (
    <div className={`${bgColors[type]} border rounded-lg shadow-lg p-3 mb-2 min-w-[280px] max-w-sm animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        <ToastIcon type={type} />
        <div className="flex-1">
          <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
        </div>
        <button onClick={() => onClose(id)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (type, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message }])
  }

  const closeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={closeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
