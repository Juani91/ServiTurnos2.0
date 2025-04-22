import { useState, useCallback } from 'react'
import Toast from '../../components/ui/Toast'
import { ToastContext } from './ToastContext'

const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false })

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type, visible: true })

    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </ToastContext.Provider>
  )
}

export default ToastProvider
